import { RuleTester } from "eslint";
import rule from "./index.js";

const ruleTester = new RuleTester({
  languageOptions: {
    ecmaVersion: 2022,
    sourceType: "module",
  },
});

ruleTester.run("no-dynamic-env-access", rule, {
  valid: [
    // Using serverEnv (recommended)
    {
      code: `
            import { serverEnv } from '@/shared/env/server-env';
            const url = serverEnv.DATABASE_URL;
          `,
    },
    // Static access to process.env (handled by no-process-env rule)
    {
      code: `
            const url = process.env.DATABASE_URL;
          `,
    },
    // Other member expressions
    {
      code: `
            const config = { DATABASE_URL: 'test' };
            const url = config['DATABASE_URL'];
          `,
    },
  ],

  invalid: [
    // Dynamic access with bracket notation
    {
      code: `
            const key = 'DATABASE_URL';
            const url = process.env[key];
          `,
      errors: [
        {
          messageId: "noDynamicEnvAccess",
        },
      ],
    },
    // Dynamic access in function
    {
      code: `
            function getEnv(key) {
              return process.env[key];
            }
          `,
      errors: [
        {
          messageId: "noDynamicEnvAccess",
        },
      ],
    },
    // Dynamic access with expression
    {
      code: `
            const url = process.env['DATABASE_' + 'URL'];
          `,
      errors: [
        {
          messageId: "noDynamicEnvAccess",
        },
      ],
    },
  ],
});
