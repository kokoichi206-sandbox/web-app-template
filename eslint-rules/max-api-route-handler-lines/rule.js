/**
 * ESLint rule to enforce maximum line count in API route handlers
 *
 * This rule ensures that API route handler files (src/app/api/route.ts files)
 * remain thin by limiting the number of lines. Heavy logic should be
 * extracted to src/server/ directory.
 *
 * Options:
 * - maxLines: Maximum allowed lines (default: 80)
 */

/** @type {import("eslint").Rule.RuleModule} */
export default {
  meta: {
    type: "suggestion",
    docs: {
      description: "Enforce maximum line count in API route handlers to keep them thin",
      recommended: true,
    },
    messages: {
      tooManyLines:
        "API route handler has {{count}} lines, but only {{max}} are allowed. Extract logic to src/server/lib/ or src/server/usecases/",
    },
    schema: [
      {
        type: "object",
        properties: {
          maxLines: {
            type: "integer",
            minimum: 1,
            default: 80,
          },
        },
        additionalProperties: false,
      },
    ],
  },

  create(context) {
    const filename = context.filename || context.getFilename();

    // Only apply to API route files: src/app/api/**/route.ts
    const isApiRoute =
      (filename.includes("/src/app/api/") || filename.includes("\\src\\app\\api\\")) &&
      (filename.endsWith("/route.ts") || filename.endsWith("\\route.ts"));

    if (!isApiRoute) {
      return {};
    }

    const options = context.options[0] || {};
    const maxLines = options.maxLines || 80;

    return {
      "Program:exit"(node) {
        const sourceCode = context.sourceCode || context.getSourceCode();
        const lines = sourceCode.lines;

        // Count non-empty, non-comment-only lines
        let lineCount = 0;
        let inMultiLineComment = false;

        for (const line of lines) {
          const trimmed = line.trim();

          // Track multi-line comments
          if (trimmed.includes("/*")) {
            inMultiLineComment = true;
          }
          if (inMultiLineComment) {
            if (trimmed.includes("*/")) {
              inMultiLineComment = false;
            }
            continue;
          }

          // Skip empty lines and single-line comments
          if (trimmed === "" || trimmed.startsWith("//")) {
            continue;
          }

          lineCount++;
        }

        if (lineCount > maxLines) {
          context.report({
            node,
            messageId: "tooManyLines",
            data: {
              count: lineCount,
              max: maxLines,
            },
            loc: { line: 1, column: 0 },
          });
        }
      },
    };
  },
};
