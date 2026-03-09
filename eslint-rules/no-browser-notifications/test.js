#!/usr/bin/env node

/**
 * Tests for no-browser-notifications ESLint rule
 */
import { RuleTester } from "eslint";
import rule from "./rule.js";

const ruleTester = new RuleTester({
  languageOptions: {
    ecmaVersion: 2020,
    sourceType: "module",
  },
});

ruleTester.run("no-browser-notifications", rule, {
  valid: [
    {
      code: `
        import { useToast } from "@/client/hooks/use-toast";

        function MyComponent() {
          const { showToast } = useToast();
          showToast({ variant: "success", message: "Operation successful!" });
        }
      `,
      filename: "/project/src/client/components/example.tsx",
    },
    {
      code: `
        const result = calculate();
        console.log(result);
      `,
      filename: "/project/src/client/utils/math.ts",
    },
    {
      code: `
        // Variables named 'alert', 'confirm', 'prompt' are allowed
        const alert = "this is a string";
        const confirm = true;
        const prompt = 42;
      `,
      filename: "/project/src/client/components/example.tsx",
    },
    {
      code: `
        import { useConfirm } from "@/client/hooks/use-confirm";

        function MyComponent() {
          const { confirm } = useConfirm();
          const handleDelete = async () => {
            const confirmed = await confirm({ message: "Are you sure?" });
            if (confirmed) {
              deleteItem();
            }
          };
        }
      `,
      filename: "/project/src/client/components/example.tsx",
    },
    {
      code: `
        import { useConfirm } from "@/client/hooks/use-confirm";

        function MyComponent() {
          const { confirm: myConfirm } = useConfirm();
          const handleDelete = async () => {
            const confirmed = await myConfirm({ message: "Are you sure?" });
            if (confirmed) {
              deleteItem();
            }
          };
        }
      `,
      filename: "/project/src/client/components/example.tsx",
    },
  ],

  invalid: [
    {
      code: `alert("Hello World");`,
      filename: "/project/src/client/components/example.tsx",
      errors: [
        {
          messageId: "noBrowserNotification",
          data: { name: "alert" },
        },
      ],
    },
    {
      code: `window.alert("Hello World");`,
      filename: "/project/src/client/components/example.tsx",
      errors: [
        {
          messageId: "noBrowserNotification",
          data: { name: "alert" },
        },
      ],
    },
    {
      code: `
        if (confirm("Are you sure?")) {
          doSomething();
        }
      `,
      filename: "/project/src/client/components/example.tsx",
      errors: [
        {
          messageId: "noBrowserNotification",
          data: { name: "confirm" },
        },
      ],
    },
    {
      code: `
        if (window.confirm("Are you sure?")) {
          doSomething();
        }
      `,
      filename: "/project/src/client/components/example.tsx",
      errors: [
        {
          messageId: "noBrowserNotification",
          data: { name: "confirm" },
        },
      ],
    },
    {
      code: `const name = prompt("Enter your name:");`,
      filename: "/project/src/client/components/example.tsx",
      errors: [
        {
          messageId: "noBrowserNotification",
          data: { name: "prompt" },
        },
      ],
    },
    {
      code: `const name = window.prompt("Enter your name:");`,
      filename: "/project/src/client/components/example.tsx",
      errors: [
        {
          messageId: "noBrowserNotification",
          data: { name: "prompt" },
        },
      ],
    },
    {
      code: `
        // Multiple violations
        alert("First");
        confirm("Second");
        prompt("Third");
      `,
      filename: "/project/src/client/components/example.tsx",
      errors: [
        { messageId: "noBrowserNotification", data: { name: "alert" } },
        { messageId: "noBrowserNotification", data: { name: "confirm" } },
        { messageId: "noBrowserNotification", data: { name: "prompt" } },
      ],
    },
    {
      code: `
        import { useConfirm } from "@/client/hooks/use-confirm";

        function ComponentA() {
          const { confirm } = useConfirm();
          confirm({ message: "test" });
        }

        function ComponentB() {
          confirm({ message: "test" });
        }
      `,
      filename: "/project/src/client/components/example.tsx",
      errors: [{ messageId: "noBrowserNotification", data: { name: "confirm" } }],
    },
    {
      code: `globalThis.alert("Hello World");`,
      filename: "/project/src/client/components/example.tsx",
      errors: [
        {
          messageId: "noBrowserNotification",
          data: { name: "alert" },
        },
      ],
    },
    {
      code: `globalThis.confirm("Are you sure?");`,
      filename: "/project/src/client/components/example.tsx",
      errors: [
        {
          messageId: "noBrowserNotification",
          data: { name: "confirm" },
        },
      ],
    },
    {
      code: `globalThis.prompt("Enter your name:");`,
      filename: "/project/src/client/components/example.tsx",
      errors: [
        {
          messageId: "noBrowserNotification",
          data: { name: "prompt" },
        },
      ],
    },
    // Computed property access tests
    {
      code: `window['alert']("test");`,
      filename: "/project/src/client/components/example.tsx",
      errors: [{ messageId: "noBrowserNotification", data: { name: "alert" } }],
    },
    {
      code: `window["confirm"]("test");`,
      filename: "/project/src/client/components/example.tsx",
      errors: [{ messageId: "noBrowserNotification", data: { name: "confirm" } }],
    },
    {
      code: `globalThis['prompt']("test");`,
      filename: "/project/src/client/components/example.tsx",
      errors: [{ messageId: "noBrowserNotification", data: { name: "prompt" } }],
    },
  ],
});

// eslint-disable-next-line no-console
console.log("All tests passed! ✨");
