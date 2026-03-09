import { RuleTester } from "eslint";
import rule from "./index.js";

const ruleTester = new RuleTester({
  languageOptions: {
    ecmaVersion: 2022,
    sourceType: "module",
  },
});

ruleTester.run("no-relative-imports-across-layers", rule, {
  valid: [
    // Same layer relative imports are allowed
    {
      code: 'import { foo } from "./foo";',
      filename: "/project/src/app/page.tsx",
    },
    {
      code: 'import { foo } from "../components/foo";',
      filename: "/project/src/app/dashboard/page.tsx",
    },
    // Absolute imports are always allowed
    {
      code: 'import { foo } from "@/server/handlers/foo";',
      filename: "/project/src/app/page.tsx",
    },
    // Importing shared/types from anywhere is allowed
    {
      code: 'import { foo } from "../shared/env/server-env";',
      filename: "/project/src/server/usecases/foo.ts",
    },
    {
      code: 'import { foo } from "../types/user";',
      filename: "/project/src/client/hooks/useUser.ts",
    },
  ],

  invalid: [
    // app -> server (should use handlers)
    {
      code: 'import { foo } from "../../../server/usecases/foo";',
      filename: "/project/src/app/page.tsx",
      errors: [
        {
          messageId: "noRelativeImportAcrossLayers",
          data: {
            fromLayer: "app",
            toLayer: "server",
          },
        },
      ],
    },
    // client -> server (should use handlers)
    {
      code: 'import { getUser } from "../../server/repositories/user-repository";',
      filename: "/project/src/client/components/UserProfile.tsx",
      errors: [
        {
          messageId: "noRelativeImportAcrossLayers",
          data: {
            fromLayer: "client",
            toLayer: "server",
          },
        },
      ],
    },
    // app -> client (should use absolute import)
    {
      code: 'import { Button } from "../../client/components/Button";',
      filename: "/project/src/app/page.tsx",
      errors: [
        {
          messageId: "noRelativeImportAcrossLayers",
          data: {
            fromLayer: "app",
            toLayer: "client",
          },
        },
      ],
    },
    // client -> app (should use absolute import)
    {
      code: 'import { metadata } from "../../app/metadata";',
      filename: "/project/src/client/components/Header.tsx",
      errors: [
        {
          messageId: "noRelativeImportAcrossLayers",
          data: {
            fromLayer: "client",
            toLayer: "app",
          },
        },
      ],
    },
  ],
});
