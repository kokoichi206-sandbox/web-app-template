import { RuleTester } from "eslint";
import rule from "./index.js";

const ruleTester = new RuleTester({
  languageOptions: {
    ecmaVersion: 2022,
    sourceType: "module",
  },
});

ruleTester.run("no-top-level-await-in-actions", rule, {
  valid: [
    // Await inside function
    {
      code: `
            export const getUsers = async () => {
              const db = await initializeDatabase();
              return await db.select().from(users);
            };
          `,
      filename: "/project/src/server/actions/user-actions.ts",
    },
    // Await in async function declaration
    {
      code: `
            export async function createUser(data) {
              const db = await initializeDatabase();
              return await db.insert(users).values(data);
            }
          `,
      filename: "/project/src/server/actions/user-actions.ts",
    },
    // Non-action files can use top-level await
    {
      code: `
            const db = await initializeDatabase();
          `,
      filename: "/project/src/server/db/connection.ts",
    },
  ],

  invalid: [
    // Top-level await in action file
    {
      code: `
            const db = await initializeDatabase();
            export const getUsers = async () => {
              return await db.select().from(users);
            };
          `,
      filename: "/project/src/server/actions/user-actions.ts",
      errors: [
        {
          messageId: "noTopLevelAwait",
        },
      ],
    },
    // Top-level await for configuration
    {
      code: `
            const config = await loadConfig();
            export const processData = async (data) => {
              return await process(data, config);
            };
          `,
      filename: "/project/src/server/actions/data-actions.ts",
      errors: [
        {
          messageId: "noTopLevelAwait",
        },
      ],
    },
    // Multiple top-level awaits
    {
      code: `
            const db = await initializeDatabase();
            const cache = await initializeCache();
            export const getData = async () => {
              return await db.select().from(data);
            };
          `,
      filename: "/project/src/server/actions/data-actions.ts",
      errors: [
        {
          messageId: "noTopLevelAwait",
        },
        {
          messageId: "noTopLevelAwait",
        },
      ],
    },
  ],
});
