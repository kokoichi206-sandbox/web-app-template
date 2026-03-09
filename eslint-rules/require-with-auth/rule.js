/**
 * ESLint rule to require withAuth/withOptionalAuth wrapper in handler files
 *
 * This rule ensures that all exported handlers in src/server/handlers/actions/
 * and src/server/handlers/api/ are wrapped with withAuth or withOptionalAuth.
 *
 * Exceptions:
 * - with-auth.ts itself
 * - Type exports
 */

/** @type {import("eslint").Rule.RuleModule} */
export default {
  meta: {
    type: "problem",
    docs: {
      description: "Require withAuth/withOptionalAuth wrapper for exported handlers",
      recommended: true,
    },
    messages: {
      missingAuthWrapper:
        "Exported handler '{{ name }}' must be wrapped with withAuth() or withOptionalAuth(). " +
        "Example: export const {{ name }} = withAuth(_{{ baseName }});",
    },
    schema: [],
  },

  create(context) {
    const filename = context.filename || context.getFilename();

    // Only apply to handler files
    const isHandlerFile =
      (filename.includes("/src/server/handlers/actions/") ||
        filename.includes("\\src\\server\\handlers\\actions\\") ||
        filename.includes("/src/server/handlers/api/") ||
        filename.includes("\\src\\server\\handlers\\api\\")) &&
      !filename.includes("with-auth");

    if (!isHandlerFile) {
      return {};
    }

    // Track which identifiers are wrapped with withAuth/withOptionalAuth
    const wrappedIdentifiers = new Set();

    return {
      // Track variable declarations that use withAuth/withOptionalAuth
      VariableDeclaration(node) {
        for (const declarator of node.declarations) {
          if (
            declarator.init &&
            declarator.init.type === "CallExpression" &&
            declarator.init.callee.type === "Identifier" &&
            (declarator.init.callee.name === "withAuth" ||
              declarator.init.callee.name === "withOptionalAuth")
          ) {
            if (declarator.id.type === "Identifier") {
              wrappedIdentifiers.add(declarator.id.name);
            }
          }
        }
      },

      // Check exported variable declarations
      ExportNamedDeclaration(node) {
        // Skip type exports
        if (node.exportKind === "type") {
          return;
        }

        // Check variable declarations
        if (node.declaration && node.declaration.type === "VariableDeclaration") {
          for (const declarator of node.declaration.declarations) {
            if (declarator.id.type !== "Identifier") {
              continue;
            }

            const name = declarator.id.name;

            // Skip type-like names (uppercase first letter or all caps)
            if (/^[A-Z]/.test(name)) {
              continue;
            }

            // Check if it's wrapped with withAuth/withOptionalAuth
            if (
              declarator.init &&
              declarator.init.type === "CallExpression" &&
              declarator.init.callee.type === "Identifier" &&
              (declarator.init.callee.name === "withAuth" ||
                declarator.init.callee.name === "withOptionalAuth")
            ) {
              // Good, it's wrapped
              continue;
            }

            // Check if it references a previously wrapped identifier
            if (
              declarator.init &&
              declarator.init.type === "Identifier" &&
              wrappedIdentifiers.has(declarator.init.name)
            ) {
              // Good, it references a wrapped variable
              continue;
            }

            // Report error - not wrapped
            const baseName = name.replace(/Action$/, "").replace(/^_/, "");
            context.report({
              node: declarator,
              messageId: "missingAuthWrapper",
              data: {
                name,
                baseName,
              },
            });
          }
        }

        // Check re-exports (export { foo })
        if (node.specifiers) {
          for (const specifier of node.specifiers) {
            if (specifier.exported.type !== "Identifier") {
              continue;
            }

            const name = specifier.exported.name;

            // Skip type-like names
            if (/^[A-Z]/.test(name)) {
              continue;
            }

            // Check if it's a wrapped identifier
            if (!wrappedIdentifiers.has(specifier.local.name)) {
              const baseName = name.replace(/Action$/, "").replace(/^_/, "");
              context.report({
                node: specifier,
                messageId: "missingAuthWrapper",
                data: {
                  name,
                  baseName,
                },
              });
            }
          }
        }
      },
    };
  },
};
