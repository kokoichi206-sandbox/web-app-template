import { RuleTester } from "eslint";
import rule from "./rule.js";

const ruleTester = new RuleTester({
  languageOptions: {
    ecmaVersion: 2022,
    sourceType: "module",
  },
});

ruleTester.run("require-with-auth", rule, {
  valid: [
    // Wrapped with withAuth - valid
    {
      code: `
        const _getItems = async (userId) => {};
        export const getItemsAction = withAuth(_getItems);
      `,
      filename: "/project/src/server/handlers/actions/items.ts",
    },
    // Wrapped with withOptionalAuth - valid
    {
      code: `
        const _listItems = async (userId) => {};
        export const listItemsAction = withOptionalAuth(_listItems);
      `,
      filename: "/project/src/server/handlers/actions/items.ts",
    },
    // Capitalized export (likely a type or constant) - valid
    {
      code: `
        export const ItemStatus = { PENDING: "pending" };
      `,
      filename: "/project/src/server/handlers/actions/items.ts",
    },
    // Not a handler file - valid
    {
      code: `
        export const someFunction = () => {};
      `,
      filename: "/project/src/server/usecases/items.ts",
    },
    // with-auth.ts itself - valid (exception)
    {
      code: `
        export const withAuth = (handler) => {};
      `,
      filename: "/project/src/server/handlers/with-auth.ts",
    },
  ],
  invalid: [
    // Not wrapped - invalid
    {
      code: `
        const getItemsAction = async () => {};
        export { getItemsAction };
      `,
      filename: "/project/src/server/handlers/actions/items.ts",
      errors: [{ messageId: "missingAuthWrapper" }],
    },
    // Exported directly without wrapper - invalid
    {
      code: `
        export const getItemsAction = async () => {};
      `,
      filename: "/project/src/server/handlers/actions/items.ts",
      errors: [{ messageId: "missingAuthWrapper" }],
    },
    // API handler without wrapper - invalid
    {
      code: `
        export const fetchData = async (body) => {};
      `,
      filename: "/project/src/server/handlers/api/data-fetch.ts",
      errors: [{ messageId: "missingAuthWrapper" }],
    },
  ],
});

// eslint-disable-next-line no-console
console.log("All tests passed!");
