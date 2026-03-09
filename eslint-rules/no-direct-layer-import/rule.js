/**
 * ESLint rule to enforce layer architecture boundaries
 *
 * This rule prohibits direct imports from repository and lib layers
 * in app/ and actions/ directories. These layers should be accessed
 * through usecases instead.
 *
 * Prohibited patterns:
 * - src/app/**  importing from @/server/repositories/* or @/server/lib/*
 * - src/server/actions/**  importing from @/server/repositories/* or @/server/lib/*
 *
 * Recommended:
 * - Import from @/server/usecases/* instead
 */

/** @type {import("eslint").Rule.RuleModule} */
export default {
  meta: {
    type: "problem",
    docs: {
      description:
        "Prohibit direct imports from repositories and lib layers without going through usecases",
      recommended: true,
    },
    messages: {
      noDirectLayerImport:
        "Do not import directly from '{{importPath}}'. Use @/server/usecases instead to maintain layer architecture.",
    },
    schema: [],
  },

  create(context) {
    const filename = context.filename || context.getFilename();

    // Normalize path separators for cross-platform compatibility
    const normalizedFilename = filename.replace(/\\/g, "/");

    // Check if file is in src/app/ or src/server/actions/
    const isInApp = /\/src\/app\//.test(normalizedFilename);
    const isInActions = /\/src\/server\/actions\//.test(normalizedFilename);

    // Skip if file is not in target directories
    if (!isInApp && !isInActions) {
      return {};
    }

    // Patterns for prohibited imports
    const prohibitedPatterns = [/^@\/server\/repositories(\/|$)/, /^@\/server\/lib(\/|$)/];

    return {
      ImportDeclaration(node) {
        const importPath = node.source.value;

        // Check if import matches any prohibited pattern
        const isProhibited = prohibitedPatterns.some((pattern) => pattern.test(importPath));

        if (isProhibited) {
          context.report({
            node: node.source,
            messageId: "noDirectLayerImport",
            data: {
              importPath,
            },
          });
        }
      },
    };
  },
};
