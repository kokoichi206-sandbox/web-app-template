// For more info, see https://github.com/storybookjs/eslint-plugin-storybook#configuration-flat-config-format
import storybook from "eslint-plugin-storybook";

import js from "@eslint/js";
import nextPlugin from "@next/eslint-plugin-next";
import importX from "eslint-plugin-import-x";
import jsxA11y from "eslint-plugin-jsx-a11y";
import reactHooks from "eslint-plugin-react-hooks";
import security from "eslint-plugin-security";
import tseslint from "typescript-eslint";
import customRules from "./eslint-rules/index.js";

/** @type {import("eslint").Linter.Config[]} */
const config = [
  {
    ignores: [
      "node_modules/",
      ".next/",
      "dist/",
      "build/",
      "storybook-static/",
      "coverage/",
      "eslint-rules/",
      "src/generated/",
      "**/__test-fixtures__/",
      "scripts/",
      "lighthouserc.js",
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    plugins: {
      "@next/next": nextPlugin,
    },
    rules: {
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs["core-web-vitals"].rules,
    },
  },
  {
    files: ["**/*.ts", "**/*.tsx", "**/*.js", "**/*.jsx"],
    ignores: ["scripts/**"],
    plugins: {
      "import-x": importX,
      "react-hooks": reactHooks,
      "jsx-a11y": jsxA11y,
      security: security,
    },
    languageOptions: {
      parserOptions: {
        project: "./tsconfig.json",
      },
    },
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
          ignoreRestSiblings: true,
        },
      ],

      "@typescript-eslint/no-explicit-any": "error",
      "no-console": [
        "error",
        {
          allow: ["warn", "error"],
        },
      ],

      "@typescript-eslint/no-non-null-assertion": "error",

      "func-style": ["warn", "expression"],

      "no-restricted-imports": [
        "error",
        {
          patterns: ["../**"],
        },
      ],

      "no-process-env": "error",

      // TypeScript 厳格化ルール
      "@typescript-eslint/strict-boolean-expressions": [
        "warn",
        {
          allowString: false,
          allowNumber: false,
          allowNullableObject: false,
        },
      ],
      "@typescript-eslint/no-unnecessary-condition": "warn",
      "@typescript-eslint/prefer-nullish-coalescing": "warn",
      "@typescript-eslint/prefer-optional-chain": "warn",
      "@typescript-eslint/no-confusing-void-expression": "warn",

      // Promise ハンドリング
      "@typescript-eslint/no-misused-promises": "warn",
      "@typescript-eslint/await-thenable": "error",
      "@typescript-eslint/promise-function-async": "warn",

      // Import 順序の統一
      "import-x/order": [
        "error",
        {
          groups: ["builtin", "external", "internal", "parent", "sibling", "index"],
          "newlines-between": "always",
          alphabetize: {
            order: "asc",
            caseInsensitive: true,
          },
        },
      ],

      // React Hooks ルール
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",

      // アクセシビリティルール
      ...jsxA11y.configs.recommended.rules,
      "jsx-a11y/anchor-is-valid": "error",
      "jsx-a11y/alt-text": "error",
      "jsx-a11y/aria-props": "error",
      "jsx-a11y/aria-proptypes": "error",
      "jsx-a11y/aria-unsupported-elements": "error",
      "jsx-a11y/role-has-required-aria-props": "error",
      "jsx-a11y/role-supports-aria-props": "error",

      // セキュリティルール
      ...security.configs.recommended.rules,
      "security/detect-object-injection": "off",
    },
  },
  // 環境変数設定ファイルでは process.env と non-null assertion を許可
  {
    files: ["src/shared/env/**/*.ts", "next.config.ts"],
    plugins: {
      custom: customRules,
    },
    rules: {
      "no-process-env": "off",
      "@typescript-eslint/no-non-null-assertion": "off",
      "custom/no-dynamic-env-access": "off",
    },
  },
  // テストファイルでは non-null assertion を許可
  {
    files: ["**/*.test.ts", "**/*.test.tsx", "src/test/**/*.ts", "src/test/**/*.tsx"],
    plugins: {
      custom: customRules,
    },
    rules: {
      "@typescript-eslint/no-non-null-assertion": "off",
      "custom/enforce-naming-convention": "off",
    },
  },
  // クライアント側では strict-boolean-expressions を緩和
  {
    files: ["src/client/**/*.ts", "src/client/**/*.tsx", "src/app/**/*.tsx"],
    rules: {
      "@typescript-eslint/strict-boolean-expressions": [
        "warn",
        {
          allowString: false,
          allowNumber: false,
          allowNullableObject: true,
        },
      ],
    },
  },
  // Custom rule: require 'server-only' in src/server/ files
  {
    files: ["src/server/**/*.ts"],
    ignores: ["src/server/**/*.test.ts"],
    plugins: {
      custom: customRules,
    },
    rules: {
      "custom/require-server-only": "error",
    },
  },
  // Custom rule: enforce file naming conventions
  {
    files: ["src/**/*.ts", "src/**/*.tsx"],
    ignores: ["src/test/**"],
    plugins: {
      custom: customRules,
    },
    rules: {
      "custom/enforce-naming-convention": "error",
    },
  },
  // Custom rule: enforce pino object as first argument
  {
    files: ["src/**/*.ts", "src/**/*.tsx"],
    plugins: {
      custom: customRules,
    },
    rules: {
      "custom/no-pino-object-in-second-arg": "error",
    },
  },
  // Custom rule: require Result return type in usecases and handlers (type-aware)
  {
    files: ["src/server/usecases/**/*.ts", "src/server/handlers/**/*.ts"],
    plugins: {
      custom: customRules,
    },
    languageOptions: {
      parserOptions: {
        project: "./tsconfig.json",
      },
    },
    rules: {
      "custom/require-result-return-type": "error",
    },
  },
  // Custom rules for test fixtures (used with --no-ignore)
  {
    files: ["eslint-rules/**/fixtures/**/*.ts", "eslint-rules/**/fixtures/**/*.tsx"],
    plugins: {
      custom: customRules,
    },
    languageOptions: {
      parserOptions: {
        project: null,
      },
    },
    rules: {
      "custom/no-pino-object-in-second-arg": "error",
      "custom/enforce-naming-convention": "error",
      "custom/max-api-route-handler-lines": ["error", { maxLines: 80 }],
      "custom/no-supabase-data-api": "error",
      "custom/require-ui-storybook-story": "error",
      "no-console": "off",
      "@typescript-eslint/no-unused-vars": "off",
      "no-restricted-imports": "off",
      "@typescript-eslint/strict-boolean-expressions": "off",
      "@typescript-eslint/no-unnecessary-condition": "off",
      "@typescript-eslint/prefer-nullish-coalescing": "off",
      "@typescript-eslint/prefer-optional-chain": "off",
      "@typescript-eslint/no-confusing-void-expression": "off",
      "@typescript-eslint/no-misused-promises": "off",
      "@typescript-eslint/await-thenable": "off",
      "@typescript-eslint/promise-function-async": "off",
    },
  },
  // Custom rule: prohibit browser notification APIs
  {
    files: ["src/**/*.ts", "src/**/*.tsx"],
    plugins: {
      custom: customRules,
    },
    rules: {
      "custom/no-browser-notifications": "error",
    },
  },
  // Custom rule: prohibit Supabase Data API usage
  {
    files: ["src/**/*.ts", "src/**/*.tsx"],
    plugins: {
      custom: customRules,
    },
    rules: {
      "custom/no-supabase-data-api": "error",
    },
  },
  // Custom rule: require Storybook stories for UI components
  {
    files: ["src/client/components/ui/**/*.tsx"],
    plugins: {
      custom: customRules,
    },
    rules: {
      "custom/require-ui-storybook-story": "error",
    },
  },
  // Custom rule: enforce layer architecture
  {
    files: ["src/app/**/*.ts", "src/app/**/*.tsx", "src/server/handlers/actions/**/*.ts"],
    ignores: ["src/app/api/auth/**"],
    plugins: {
      custom: customRules,
    },
    rules: {
      "custom/no-direct-layer-import": "error",
    },
  },
  // Custom rule: prohibit throw statements in server code
  {
    files: ["src/server/**/*.ts"],
    plugins: {
      custom: customRules,
    },
    rules: {
      "custom/no-throw-statement": "error",
    },
  },
  // Custom rule: restrict @/server/* imports from outside src/server/
  {
    files: ["src/**/*.ts", "src/**/*.tsx"],
    ignores: ["src/server/**"],
    plugins: {
      custom: customRules,
    },
    rules: {
      "custom/no-direct-server-import": "error",
    },
  },
  // Custom rule: require withAuth wrapper in handler files
  {
    files: ["src/server/handlers/actions/**/*.ts", "src/server/handlers/api/**/*.ts"],
    plugins: {
      custom: customRules,
    },
    rules: {
      "custom/require-with-auth": "error",
    },
  },
  // Custom rule: enforce Japanese JSDoc formatting standards
  {
    files: ["src/**/*.ts", "src/**/*.tsx"],
    plugins: {
      custom: customRules,
    },
    rules: {
      "custom/jsdoc-format-japanese": "error",
    },
  },
  // Custom rule: enforce object parameters for functions with many arguments
  {
    files: ["src/**/*.ts", "src/**/*.tsx"],
    plugins: {
      custom: customRules,
    },
    rules: {
      "custom/max-params-with-object": ["error", { max: 3 }],
    },
  },
  // Custom rule: prohibit relative imports across architectural layers
  {
    files: ["src/**/*.ts", "src/**/*.tsx"],
    plugins: {
      custom: customRules,
    },
    rules: {
      "custom/no-relative-imports-across-layers": "error",
    },
  },
  // Custom rule: enforce proper error handling patterns in try-catch blocks
  {
    files: ["src/server/**/*.ts"],
    plugins: {
      custom: customRules,
    },
    rules: {
      "custom/enforce-error-handling-pattern": "warn",
    },
  },
  // Custom rule: prohibit dynamic access to process.env
  {
    files: ["src/**/*.ts", "src/**/*.tsx"],
    ignores: ["src/shared/env/**/*.ts", "src/test/**/*.ts", "src/test/**/*.tsx"],
    plugins: {
      custom: customRules,
    },
    rules: {
      "custom/no-dynamic-env-access": "error",
    },
  },
  // Custom rule: prohibit magic strings in SQL queries
  {
    files: ["src/server/**/*.ts"],
    plugins: {
      custom: customRules,
    },
    rules: {
      "custom/no-magic-strings-in-sql": "warn",
    },
  },
  // Custom rule: prohibit top-level await in Server Actions
  {
    files: ["src/server/handlers/actions/**/*.ts"],
    plugins: {
      custom: customRules,
    },
    rules: {
      "custom/no-top-level-await-in-actions": "error",
    },
  },
  // Custom rule: enforce maximum line count in API route handlers
  {
    files: ["src/app/api/**/route.ts"],
    plugins: {
      custom: customRules,
    },
    rules: {
      "custom/max-api-route-handler-lines": ["error", { maxLines: 80 }],
    },
  },
  // Server-side: Promise の await 漏れを型情報で検出
  {
    files: [
      "src/server/usecases/**/*.ts",
      "src/server/handlers/**/*.ts",
      "src/server/repositories/**/*.ts",
    ],
    languageOptions: {
      parserOptions: {
        project: "./tsconfig.json",
      },
    },
    rules: {
      "@typescript-eslint/no-floating-promises": ["error", { ignoreVoid: false }],
    },
  },
  // Relaxed rules for scripts
  {
    files: ["scripts/**/*.ts"],
    rules: {
      "no-console": "off",
      "no-process-env": "off",
      "security/detect-non-literal-fs-filename": "off",
      "security/detect-object-injection": "off",
      "func-style": "off",
      "@typescript-eslint/strict-boolean-expressions": "off",
      "@typescript-eslint/prefer-nullish-coalescing": "off",
      "@typescript-eslint/no-confusing-void-expression": "off",
      "@typescript-eslint/promise-function-async": "off",
      "@typescript-eslint/no-misused-promises": "off",
      "@typescript-eslint/no-unnecessary-condition": "off",
    },
  },
  ...storybook.configs["flat/recommended"],
];

export default config;
