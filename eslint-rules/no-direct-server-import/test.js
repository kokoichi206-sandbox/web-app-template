import { RuleTester } from "eslint";
import rule from "./rule.js";

const ruleTester = new RuleTester({
  languageOptions: {
    ecmaVersion: 2022,
    sourceType: "module",
  },
});

ruleTester.run("no-direct-server-import", rule, {
  valid: [
    // Files inside src/server/ can import anything from @/server/*
    {
      code: `import { foo } from "@/server/repositories/user";`,
      filename: "/project/src/server/usecases/user-usecase.ts",
    },
    {
      code: `import { bar } from "@/server/lib/auth";`,
      filename: "/project/src/server/usecases/auth-usecase.ts",
    },
    {
      code: `import { db } from "@/server/db";`,
      filename: "/project/src/server/repositories/user-repository.ts",
    },

    // Files outside src/server/ can import from @/server/handlers/*
    {
      code: `import { listReportsWithPaginationAction } from "@/server/handlers/actions/reports";`,
      filename: "/project/src/app/(dashboard)/reports/page.tsx",
    },
    {
      code: `import { handlers } from "@/server/handlers/api/auth";`,
      filename: "/project/src/app/api/auth/[...nextauth]/route.ts",
    },
    {
      code: `import { withAuth } from "@/server/handlers/with-auth";`,
      filename: "/project/src/app/api/something/route.ts",
    },

    // Non-server imports are always allowed
    {
      code: `import { Button } from "@/client/components/Button";`,
      filename: "/project/src/app/(dashboard)/page.tsx",
    },
    {
      code: `import { logger } from "@/shared/logger";`,
      filename: "/project/src/app/(dashboard)/page.tsx",
    },
  ],

  invalid: [
    // Files outside src/server/ cannot import from @/server/repositories/*
    {
      code: `import { userRepository } from "@/server/repositories/user";`,
      filename: "/project/src/app/(dashboard)/page.tsx",
      errors: [{ messageId: "noDirectServerImport" }],
    },

    // Files outside src/server/ cannot import from @/server/lib/*
    {
      code: `import { getAuthService } from "@/server/lib/auth";`,
      filename: "/project/src/app/api/auth/callback/route.ts",
      errors: [{ messageId: "noDirectServerImport" }],
    },

    // Files outside src/server/ cannot import from @/server/usecases/*
    {
      code: `import { createReport } from "@/server/usecases/report-usecase";`,
      filename: "/project/src/app/(dashboard)/reports/page.tsx",
      errors: [{ messageId: "noDirectServerImport" }],
    },

    // Files outside src/server/ cannot import from @/server/db/*
    {
      code: `import { Job } from "@/server/db/schema";`,
      filename: "/project/src/app/(dashboard)/reports/components/ReportsTable.tsx",
      errors: [{ messageId: "noDirectServerImport" }],
    },

    // Files in src/client/ cannot import from @/server/* (except handlers)
    {
      code: `import { db } from "@/server/db";`,
      filename: "/project/src/client/hooks/useReports.ts",
      errors: [{ messageId: "noDirectServerImport" }],
    },

    // Files in src/shared/ cannot import from @/server/* (except handlers)
    {
      code: `import { userRepository } from "@/server/repositories/user";`,
      filename: "/project/src/shared/utils/helper.ts",
      errors: [{ messageId: "noDirectServerImport" }],
    },
  ],
});

console.log("All tests passed!");
