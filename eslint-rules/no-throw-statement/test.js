#!/usr/bin/env node

/**
 * Tests for no-throw-statement ESLint rule
 */
import { RuleTester } from "eslint";
import rule from "./rule.js";

const ruleTester = new RuleTester({
  languageOptions: {
    ecmaVersion: 2020,
    sourceType: "module",
  },
});

ruleTester.run("no-throw-statement", rule, {
  valid: [
    {
      code: `
        import { err, ok } from "@/server/lib/result";

        function validateInput(input) {
          if (!input) {
            return err("Input is required");
          }
          return ok(input);
        }
      `,
      filename: "/project/src/server/usecases/example.ts",
    },
    {
      code: `
        import { Result } from "@/server/lib/result";

        function fetchData() {
          if (error) {
            return Result.err("Failed to fetch data");
          }
          return Result.ok(data);
        }
      `,
      filename: "/project/src/server/repositories/example.ts",
    },
    {
      code: `
        // try-catch is allowed for catching external errors
        function handleExternal() {
          try {
            externalLibrary.doSomething();
          } catch (error) {
            return err("External library failed");
          }
        }
      `,
      filename: "/project/src/server/lib/example.ts",
    },
  ],

  invalid: [
    {
      code: `throw new Error("Something went wrong");`,
      filename: "/project/src/server/usecases/example.ts",
      errors: [
        {
          messageId: "noThrowStatement",
        },
      ],
    },
    {
      code: `
        function validateInput(input) {
          if (!input) {
            throw new Error("Input is required");
          }
          return input;
        }
      `,
      filename: "/project/src/server/usecases/example.ts",
      errors: [
        {
          messageId: "noThrowStatement",
        },
      ],
    },
    {
      code: `throw "string error";`,
      filename: "/project/src/server/lib/example.ts",
      errors: [
        {
          messageId: "noThrowStatement",
        },
      ],
    },
    {
      code: `
        async function fetchData() {
          const response = await fetch(url);
          if (!response.ok) {
            throw new Error("Request failed");
          }
          return response.json();
        }
      `,
      filename: "/project/src/server/repositories/example.ts",
      errors: [
        {
          messageId: "noThrowStatement",
        },
      ],
    },
    {
      code: `
        // Multiple throw statements
        function process(value) {
          if (!value) {
            throw new Error("Value is required");
          }
          if (value < 0) {
            throw new Error("Value must be positive");
          }
          return value;
        }
      `,
      filename: "/project/src/server/usecases/example.ts",
      errors: [{ messageId: "noThrowStatement" }, { messageId: "noThrowStatement" }],
    },
    {
      code: `
        // Re-throwing in catch block
        try {
          doSomething();
        } catch (error) {
          throw error;
        }
      `,
      filename: "/project/src/server/lib/example.ts",
      errors: [
        {
          messageId: "noThrowStatement",
        },
      ],
    },
  ],
});

// eslint-disable-next-line no-console
console.log("All tests passed!");
