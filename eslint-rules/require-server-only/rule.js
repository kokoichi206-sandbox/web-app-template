/**
 * ESLint rule to require 'server-only' import in src/server directory
 *
 * This rule ensures that all TypeScript files under src/server/ include
 * the 'server-only' directive to prevent accidental client-side imports.
 *
 * Exceptions:
 * - Files with "use server" directive (Server Actions)
 */

/** @type {import("eslint").Rule.RuleModule} */
export default {
  meta: {
    type: "problem",
    docs: {
      description: "Require 'server-only' import in src/server directory files",
      recommended: true,
    },
    fixable: "code",
    messages: {
      missingServerOnly:
        "Files in src/server/ must import 'server-only' to prevent client-side imports. Add `import 'server-only';` at the top of the file.",
    },
    schema: [],
  },

  create(context) {
    const filename = context.filename || context.getFilename();

    // Only apply to files in src/server/
    if (!filename.includes("/src/server/") && !filename.includes("\\src\\server\\")) {
      return {};
    }

    let hasServerOnlyImport = false;
    let hasUseServerDirective = false;
    let firstImportNode = null;

    return {
      // Check for "use server" directive
      ExpressionStatement(node) {
        if (node.expression.type === "Literal" && node.expression.value === "use server") {
          hasUseServerDirective = true;
        }
      },

      // Check for 'server-only' import
      ImportDeclaration(node) {
        if (!firstImportNode) {
          firstImportNode = node;
        }
        if (node.source.value === "server-only") {
          hasServerOnlyImport = true;
        }
      },

      // Report at the end of the program
      "Program:exit"(node) {
        // Skip if file has "use server" directive (Server Actions)
        if (hasUseServerDirective) {
          return;
        }

        // Report if 'server-only' import is missing
        if (!hasServerOnlyImport) {
          context.report({
            node: node,
            messageId: "missingServerOnly",
            loc: { line: 1, column: 0 },
            fix(fixer) {
              // Add 'server-only' import at the beginning of the file
              if (firstImportNode) {
                return fixer.insertTextBefore(firstImportNode, "import 'server-only';\n\n");
              }
              // If no imports exist, add at the very beginning
              const sourceCode = context.sourceCode || context.getSourceCode();
              const firstToken = sourceCode.getFirstToken(node);
              if (firstToken) {
                return fixer.insertTextBefore(firstToken, "import 'server-only';\n\n");
              }
              return null;
            },
          });
        }
      },
    };
  },
};
