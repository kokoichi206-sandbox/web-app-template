#!/usr/bin/env node

/**
 * Tests for require-server-only ESLint rule
 */
import { RuleTester } from "eslint";
import rule from "./rule.js";

const ruleTester = new RuleTester({
  languageOptions: {
    ecmaVersion: 2020,
    sourceType: "module",
  },
});

ruleTester.run("require-server-only", rule, {
  valid: [
    // Has server-only import
    {
      code: `import 'server-only';\nimport { db } from './db';`,
      filename: "/project/src/server/lib/example.ts",
    },
    // Has "use server" directive (Server Actions)
    {
      code: `"use server";\nexport async function action() {}`,
      filename: "/project/src/server/actions/example.ts",
    },
    // Not in src/server directory - should be ignored
    {
      code: `import { useState } from 'react';`,
      filename: "/project/src/client/components/Button.ts",
    },
    // server-only import with other imports
    {
      code: `import 'server-only';\nimport { PrismaClient } from '@prisma/client';\nimport { Pool } from 'pg';`,
      filename: "/project/src/server/db/client.ts",
    },
  ],

  invalid: [
    // Missing server-only import in src/server
    {
      code: `import { db } from './db';`,
      filename: "/project/src/server/lib/example.ts",
      errors: [{ messageId: "missingServerOnly" }],
      output: `import 'server-only';\n\nimport { db } from './db';`,
    },
    // Empty file in src/server
    {
      code: `const x = 1;`,
      filename: "/project/src/server/lib/example.ts",
      errors: [{ messageId: "missingServerOnly" }],
      output: `import 'server-only';\n\nconst x = 1;`,
    },
    // Has other imports but not server-only
    {
      code: `import { PrismaClient } from '@prisma/client';\nimport { Pool } from 'pg';`,
      filename: "/project/src/server/db/client.ts",
      errors: [{ messageId: "missingServerOnly" }],
      output: `import 'server-only';\n\nimport { PrismaClient } from '@prisma/client';\nimport { Pool } from 'pg';`,
    },
  ],
});

// eslint-disable-next-line no-console
console.log("All tests passed! ✨");
