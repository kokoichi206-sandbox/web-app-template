/**
 * @fileoverview Prohibit dynamic access to process.env.
 *
 * This rule prevents dynamic access patterns like process.env[variable],
 * which bypass type checking and can lead to runtime errors.
 *
 * Bad:
 *   const key = 'DATABASE_URL';
 *   const url = process.env[key];
 *
 * Good:
 *   import { serverEnv } from '@/shared/env/server-env';
 *   const url = serverEnv.DATABASE_URL;
 */

/** @type {import('eslint').Rule.RuleModule} */
export default {
  meta: {
    type: "problem",
    docs: {
      description: "Prohibit dynamic access to process.env",
      category: "Best Practices",
      recommended: true,
    },
    messages: {
      noDynamicEnvAccess:
        "Dynamic access to process.env is not allowed. Use static access via serverEnv from '@/shared/env/server-env'.",
    },
    schema: [],
  },

  create(context) {
    return {
      MemberExpression(node) {
        // Check for process.env[variable] pattern
        if (
          node.object.type === "MemberExpression" &&
          node.object.object.name === "process" &&
          node.object.property.name === "env" &&
          node.computed === true
        ) {
          context.report({
            node,
            messageId: "noDynamicEnvAccess",
          });
        }
      },
    };
  },
};
