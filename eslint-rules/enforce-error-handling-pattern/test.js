import { RuleTester } from "eslint";
import rule from "./index.js";

const ruleTester = new RuleTester({
  languageOptions: {
    ecmaVersion: 2022,
    sourceType: "module",
  },
});

ruleTester.run("enforce-error-handling-pattern", rule, {
  valid: [
    // Proper error handling with throw
    {
      code: `
            async function test() {
              try {
                await operation();
              } catch (e) {
                logger.error({ error: e }, 'Operation failed');
                throw e;
              }
            }
          `,
      filename: "/project/src/server/usecases/foo.ts",
    },
    // Proper error handling with return
    {
      code: `
            async function test() {
              try {
                await operation();
              } catch (e) {
                logger.error({ error: e }, 'Operation failed');
                return err(e);
              }
            }
          `,
      filename: "/project/src/server/usecases/foo.ts",
    },
    // Conditional error handling
    {
      code: `
            async function test() {
              try {
                await operation();
              } catch (e) {
                if (isRetryable(e)) {
                  return err(e);
                }
                throw e;
              }
            }
          `,
      filename: "/project/src/server/usecases/foo.ts",
    },
    // Non-server files are not checked
    {
      code: `
            try {
              await operation();
            } catch (e) {
              console.error(e);
            }
          `,
      filename: "/project/src/client/components/Foo.tsx",
    },
  ],

  invalid: [
    // Error is caught but not propagated
    {
      code: `
            async function test() {
              try {
                await operation();
              } catch (e) {
                logger.error({ error: e }, 'Operation failed');
              }
            }
          `,
      filename: "/project/src/server/usecases/foo.ts",
      errors: [
        {
          messageId: "missingErrorPropagation",
        },
      ],
    },
    // Using console.error instead of logger
    {
      code: `
            async function test() {
              try {
                await operation();
              } catch (e) {
                console.error(e);
                throw e;
              }
            }
          `,
      filename: "/project/src/server/usecases/foo.ts",
      errors: [
        {
          messageId: "useLoggerNotConsole",
        },
      ],
    },
    // Error is completely ignored
    {
      code: `
            async function test() {
              try {
                await operation();
              } catch (e) {
                // Do nothing
              }
            }
          `,
      filename: "/project/src/server/repositories/user-repository.ts",
      errors: [
        {
          messageId: "missingErrorPropagation",
        },
      ],
    },
  ],
});
