/**
 * ESLint rule to restrict server imports from outside src/server/
 *
 * Files outside src/server/ can only import from @/server/handlers/*.
 * All other @/server/* imports are prohibited.
 *
 * This ensures:
 * - Server logic is encapsulated within src/server/
 * - External code accesses server functionality only through handlers
 * - Clear boundary between client/shared code and server internals
 */

/** @type {import("eslint").Rule.RuleModule} */
export default {
  meta: {
    type: "problem",
    docs: {
      description:
        "Prohibit direct imports from @/server/* except @/server/handlers/* outside of src/server/",
      recommended: true,
    },
    messages: {
      noDirectServerImport:
        "Do not import directly from '{{importPath}}'. Import from @/server/handlers/* instead, or move this file into src/server/.",
    },
    schema: [],
  },

  create(context) {
    const filename = context.filename || context.getFilename();

    // Normalize path separators for cross-platform compatibility
    const normalizedFilename = filename.replace(/\\/g, "/");

    // Skip if file is inside src/server/
    const isInServer = /\/src\/server\//.test(normalizedFilename);
    if (isInServer) {
      return {};
    }

    return {
      ImportDeclaration(node) {
        const importPath = node.source.value;

        // Check if importing from @/server/*
        if (!importPath.startsWith("@/server/")) {
          return;
        }

        // Allow @/server/handlers/*
        if (importPath.startsWith("@/server/handlers")) {
          return;
        }

        // All other @/server/* imports are prohibited
        context.report({
          node: node.source,
          messageId: "noDirectServerImport",
          data: {
            importPath,
          },
        });
      },
    };
  },
};
