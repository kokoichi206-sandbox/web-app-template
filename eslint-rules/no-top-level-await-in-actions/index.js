/**
 * @fileoverview Prohibit top-level await in Server Actions.
 *
 * This rule prevents using await at the top level of Server Action files,
 * which can cause performance issues in serverless environments (cold starts).
 *
 * Bad:
 *   const db = await initializeDatabase();
 *   export const getUsers = async () => {
 *     return await db.select().from(users);
 *   };
 *
 * Good:
 *   export const getUsers = async () => {
 *     const db = await initializeDatabase();
 *     return await db.select().from(users);
 *   };
 */

/** @type {import('eslint').Rule.RuleModule} */
export default {
  meta: {
    type: "problem",
    docs: {
      description: "Prohibit top-level await in Server Actions",
      category: "Best Practices",
      recommended: true,
    },
    messages: {
      noTopLevelAwait:
        "Top-level await is not allowed in Server Actions. Move the await inside the function to avoid cold start overhead.",
    },
    schema: [],
  },

  create(context) {
    return {
      AwaitExpression(node) {
        const filename = context.filename || context.getFilename();

        // Only check src/server/actions/ files
        if (!filename.includes("/src/server/actions/")) {
          return;
        }

        // Check if this await is at the top level (not inside a function)
        let parent = node.parent;
        let isTopLevel = true;

        while (parent) {
          // If we find a function declaration/expression, it's not top-level
          if (
            parent.type === "FunctionDeclaration" ||
            parent.type === "FunctionExpression" ||
            parent.type === "ArrowFunctionExpression"
          ) {
            isTopLevel = false;
            break;
          }

          // If we reach the Program node, it's top-level
          if (parent.type === "Program") {
            break;
          }

          parent = parent.parent;
        }

        if (isTopLevel) {
          context.report({
            node,
            messageId: "noTopLevelAwait",
          });
        }
      },
    };
  },
};
