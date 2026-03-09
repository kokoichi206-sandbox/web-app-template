#!/usr/bin/env node

/**
 * Tests for enforce-naming-convention ESLint rule
 */
import { RuleTester } from "eslint";
import rule from "./rule.js";

const ruleTester = new RuleTester({
  languageOptions: {
    ecmaVersion: 2020,
    sourceType: "module",
  },
});

ruleTester.run("enforce-naming-convention", rule, {
  valid: [
    // ==========================================
    // TSX files: PascalCase
    // ==========================================
    {
      code: `export default function Button() {}`,
      filename: "/project/src/client/components/Button.tsx",
    },
    {
      code: `export default function UserProfile() {}`,
      filename: "/project/src/client/components/UserProfile.tsx",
    },
    {
      code: `export default function DataTable() {}`,
      filename: "/project/src/client/components/DataTable.tsx",
    },
    // Component in PascalCase directory (allowed - only page.tsx directories are checked)
    {
      code: `export default function Avatar() {}`,
      filename: "/project/src/client/components/UserProfile/Avatar.tsx",
    },

    // ==========================================
    // Next.js special files (allowed as lowercase)
    // ==========================================
    {
      code: `export default function Page() {}`,
      filename: "/project/src/app/dashboard/page.tsx",
    },
    {
      code: `export default function Layout() {}`,
      filename: "/project/src/app/layout.tsx",
    },
    {
      code: `export default function Loading() {}`,
      filename: "/project/src/app/loading.tsx",
    },
    {
      code: `export default function Error() {}`,
      filename: "/project/src/app/error.tsx",
    },
    {
      code: `export default function NotFound() {}`,
      filename: "/project/src/app/not-found.tsx",
    },
    {
      code: `export default function Template() {}`,
      filename: "/project/src/app/template.tsx",
    },
    {
      code: `export default function Default() {}`,
      filename: "/project/src/app/default.tsx",
    },
    {
      code: `export function GET() {}`,
      filename: "/project/src/app/api/route.ts",
    },
    {
      code: `export default function GlobalError() {}`,
      filename: "/project/src/app/global-error.tsx",
    },
    {
      code: `export function middleware() {}`,
      filename: "/project/src/middleware.ts",
    },
    {
      code: `export function register() {}`,
      filename: "/project/src/instrumentation.ts",
    },

    // ==========================================
    // TS files: kebab-case
    // ==========================================
    {
      code: `export const db = {};`,
      filename: "/project/src/server/db/client.ts",
    },
    {
      code: `export function fetchUser() {}`,
      filename: "/project/src/server/repositories/user-repository.ts",
    },
    {
      code: `export const config = {};`,
      filename: "/project/src/shared/env/server-env.ts",
    },

    // ==========================================
    // index files (always allowed)
    // ==========================================
    {
      code: `export * from './button';`,
      filename: "/project/src/client/components/index.ts",
    },
    {
      code: `export { Button } from './Button';`,
      filename: "/project/src/client/components/index.tsx",
    },

    // ==========================================
    // Route directories with page.tsx: kebab-case
    // ==========================================
    {
      code: `export default function Page() {}`,
      filename: "/project/src/app/user-profile/page.tsx",
    },
    {
      code: `export default function Page() {}`,
      filename: "/project/src/app/auth-callback/page.tsx",
    },

    // ==========================================
    // Special directory patterns (Next.js)
    // ==========================================
    // Route parameters [id]
    {
      code: `export default function Page() {}`,
      filename: "/project/src/app/users/[id]/page.tsx",
    },
    // Catch-all routes [...slug]
    {
      code: `export default function Page() {}`,
      filename: "/project/src/app/docs/[...slug]/page.tsx",
    },
    // Optional catch-all routes [[...catchAll]]
    {
      code: `export default function Page() {}`,
      filename: "/project/src/app/shop/[[...categories]]/page.tsx",
    },
    // Route groups (marketing)
    {
      code: `export default function Page() {}`,
      filename: "/project/src/app/(marketing)/page.tsx",
    },
    // Parallel routes @modal
    {
      code: `export default function Page() {}`,
      filename: "/project/src/app/@modal/page.tsx",
    },
    // Private folders _components
    {
      code: `export default function Page() {}`,
      filename: "/project/src/app/_internal/page.tsx",
    },
    // app directory root
    {
      code: `export default function Page() {}`,
      filename: "/project/src/app/page.tsx",
    },

    // ==========================================
    // Outside src/ (ignored)
    // ==========================================
    {
      code: `module.exports = {};`,
      filename: "/project/eslint-rules/my-rule.js",
    },
    {
      code: `export default {};`,
      filename: "/project/drizzle.config.ts",
    },
  ],

  invalid: [
    // ==========================================
    // TSX files: should be PascalCase
    // ==========================================
    {
      code: `export default function Button() {}`,
      filename: "/project/src/client/components/button.tsx",
      errors: [
        {
          messageId: "invalidTsxFileName",
          data: { name: "button", suggestion: "Button" },
        },
      ],
    },
    {
      code: `export default function UserProfile() {}`,
      filename: "/project/src/client/components/user-profile.tsx",
      errors: [
        {
          messageId: "invalidTsxFileName",
          data: { name: "user-profile", suggestion: "UserProfile" },
        },
      ],
    },
    {
      code: `export default function DataTable() {}`,
      filename: "/project/src/client/components/dataTable.tsx",
      errors: [
        {
          messageId: "invalidTsxFileName",
          data: { name: "dataTable", suggestion: "DataTable" },
        },
      ],
    },

    // ==========================================
    // TS files: should be kebab-case
    // ==========================================
    {
      code: `export const db = {};`,
      filename: "/project/src/server/db/Client.ts",
      errors: [
        {
          messageId: "invalidTsFileName",
          data: { name: "Client", suggestion: "client" },
        },
      ],
    },
    {
      code: `export function fetchUser() {}`,
      filename: "/project/src/server/repositories/userRepository.ts",
      errors: [
        {
          messageId: "invalidTsFileName",
          data: { name: "userRepository", suggestion: "user-repository" },
        },
      ],
    },
    {
      code: `export const config = {};`,
      filename: "/project/src/shared/env/serverEnv.ts",
      errors: [
        {
          messageId: "invalidTsFileName",
          data: { name: "serverEnv", suggestion: "server-env" },
        },
      ],
    },
    {
      code: `export const config = {};`,
      filename: "/project/src/shared/env/server_env.ts",
      errors: [
        {
          messageId: "invalidTsFileName",
          data: { name: "server_env", suggestion: "server-env" },
        },
      ],
    },

    // ==========================================
    // Route directory names (page.tsx): should be kebab-case
    // ==========================================
    {
      code: `export default function Page() {}`,
      filename: "/project/src/app/UserProfile/page.tsx",
      errors: [
        {
          messageId: "invalidRouteDirectoryName",
          data: { name: "UserProfile", suggestion: "user-profile" },
        },
      ],
    },
    {
      code: `export default function Page() {}`,
      filename: "/project/src/app/authCallback/page.tsx",
      errors: [
        {
          messageId: "invalidRouteDirectoryName",
          data: { name: "authCallback", suggestion: "auth-callback" },
        },
      ],
    },
  ],
});

// eslint-disable-next-line no-console
console.log("All tests passed! ✨");
