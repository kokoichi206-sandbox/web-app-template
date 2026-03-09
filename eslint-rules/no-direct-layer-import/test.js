#!/usr/bin/env node

/**
 * Tests for no-direct-layer-import ESLint rule
 */
import { RuleTester } from "eslint";
import rule from "./rule.js";

const ruleTester = new RuleTester({
  languageOptions: {
    ecmaVersion: 2020,
    sourceType: "module",
  },
});

ruleTester.run("no-direct-layer-import", rule, {
  valid: [
    // Allowed: importing from usecases in app/
    {
      code: `import { getReports } from "@/server/usecases/report";`,
      filename: "/project/src/app/reports/page.tsx",
    },
    // Allowed: importing from usecases in actions/
    {
      code: `import { createReport } from "@/server/usecases/report";`,
      filename: "/project/src/server/actions/report-actions.ts",
    },
    // Allowed: importing repositories in usecases (not in app/ or actions/)
    {
      code: `import { reportRepository } from "@/server/repositories/report";`,
      filename: "/project/src/server/usecases/report.ts",
    },
    // Allowed: importing lib in usecases
    {
      code: `import { googleAdsClient } from "@/server/lib/adapters/google-ads";`,
      filename: "/project/src/server/usecases/ads.ts",
    },
    // Allowed: importing lib in repositories
    {
      code: `import { db } from "@/server/lib/database";`,
      filename: "/project/src/server/repositories/user.ts",
    },
    // Allowed: other imports in app/
    {
      code: `import { Button } from "@/client/components/ui/button";`,
      filename: "/project/src/app/reports/page.tsx",
    },
    // Allowed: importing from shared in app/
    {
      code: `import { logger } from "@/shared/logger";`,
      filename: "/project/src/app/api/route.ts",
    },
    // Allowed: importing from client in app/
    {
      code: `import { useToast } from "@/client/hooks/use-toast";`,
      filename: "/project/src/app/components/Header.tsx",
    },
  ],

  invalid: [
    // Prohibited: importing repositories in app/
    {
      code: `import { userRepository } from "@/server/repositories/user";`,
      filename: "/project/src/app/api/users/route.ts",
      errors: [
        {
          messageId: "noDirectLayerImport",
          data: { importPath: "@/server/repositories/user" },
        },
      ],
    },
    // Prohibited: importing repositories in app/ page
    {
      code: `import { reportRepository } from "@/server/repositories/report";`,
      filename: "/project/src/app/reports/page.tsx",
      errors: [
        {
          messageId: "noDirectLayerImport",
          data: { importPath: "@/server/repositories/report" },
        },
      ],
    },
    // Prohibited: importing lib in app/
    {
      code: `import { googleAdsClient } from "@/server/lib/adapters/google-ads";`,
      filename: "/project/src/app/api/google-ads/fetch/route.ts",
      errors: [
        {
          messageId: "noDirectLayerImport",
          data: { importPath: "@/server/lib/adapters/google-ads" },
        },
      ],
    },
    // Prohibited: importing repositories in actions/
    {
      code: `import { userRepository } from "@/server/repositories/user";`,
      filename: "/project/src/server/actions/user-actions.ts",
      errors: [
        {
          messageId: "noDirectLayerImport",
          data: { importPath: "@/server/repositories/user" },
        },
      ],
    },
    // Prohibited: importing lib in actions/
    {
      code: `import { yahooAdsClient } from "@/server/lib/adapters/yahoo-ads";`,
      filename: "/project/src/server/actions/ads-actions.ts",
      errors: [
        {
          messageId: "noDirectLayerImport",
          data: { importPath: "@/server/lib/adapters/yahoo-ads" },
        },
      ],
    },
    // Prohibited: importing repositories index
    {
      code: `import { repositories } from "@/server/repositories";`,
      filename: "/project/src/app/api/route.ts",
      errors: [
        {
          messageId: "noDirectLayerImport",
          data: { importPath: "@/server/repositories" },
        },
      ],
    },
    // Prohibited: importing lib index
    {
      code: `import { adapters } from "@/server/lib";`,
      filename: "/project/src/app/api/route.ts",
      errors: [
        {
          messageId: "noDirectLayerImport",
          data: { importPath: "@/server/lib" },
        },
      ],
    },
    // Prohibited: multiple violations
    {
      code: `
        import { userRepository } from "@/server/repositories/user";
        import { googleClient } from "@/server/lib/adapters/google";
      `,
      filename: "/project/src/app/api/route.ts",
      errors: [
        {
          messageId: "noDirectLayerImport",
          data: { importPath: "@/server/repositories/user" },
        },
        {
          messageId: "noDirectLayerImport",
          data: { importPath: "@/server/lib/adapters/google" },
        },
      ],
    },
  ],
});

// eslint-disable-next-line no-console
console.log("All tests passed! ✨");
