import path from "node:path";
import { fileURLToPath } from "node:url";

import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // server-only はテスト環境では空モジュールに置き換える
      "server-only": path.resolve(__dirname, "./vitest.server-only-mock.ts"),
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    include: [
      "src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}",
      "eslint-rules/**/*.spec.js",
      "eslint-rules/**/test.js",
    ],
    exclude: [
      "**/node_modules/**",
      "**/dist/**",
      "**/.{git,cache,output,temp}/**",
      // execSync で eslint を直接実行するテスト (RuleTester 非使用)
      "eslint-rules/no-pino-object-in-second-arg/test.js",
      "eslint-rules/max-api-route-handler-lines/test.js",
      "eslint-rules/no-supabase-data-api/test.js",
      "eslint-rules/require-ui-storybook-story/test.js",
    ],
    // 30 seconds for integration tests with type-checking.
    testTimeout: 30000,
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: [
        "coverage/**",
        "dist/**",
        "**/[.]**",
        "packages/*/test{,s}/**",
        "**/*.d.ts",
        "**/virtual:*",
        "**/__x00__*",
        "**/\x00*",
        "cypress/**",
        "test{,s}/**",
        "test{,-*}.{js,cjs,mjs,ts,tsx,jsx}",
        "**/*{.,-}test.{js,cjs,mjs,ts,tsx,jsx}",
        "**/*{.,-}spec.{js,cjs,mjs,ts,tsx,jsx}",
        "**/__tests__/**",
        "**/{karma,rollup,webpack,vite,vitest,jest,ava,babel,nyc,cypress,tsup,build}.config.*",
        "**/.{eslint,mocha,prettier}rc.{js,cjs,yml}",
        // Next.js specific exclusions
        ".next/**",
        "next.config.*",
        "src/app/**/layout.tsx",
        "src/app/**/loading.tsx",
        "src/app/**/not-found.tsx",
        "src/app/**/error.tsx",
        "src/app/**/global-error.tsx",
        // Generated files
        "src/generated/**",
        // Config files
        "src/shared/env/**",
        // ESLint rules
        "eslint-rules/**",
      ],
      thresholds: {
        global: {
          branches: 80,
          functions: 80,
          lines: 80,
          statements: 80,
        },
      },
    },
  },
});
