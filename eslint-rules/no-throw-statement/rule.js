/**
 * ESLint rule to prohibit throw statements in server code
 *
 * This rule enforces the use of Result type for error handling instead of
 * throwing exceptions. Throwing exceptions can lead to unexpected control flow
 * and makes error handling less explicit.
 *
 * Instead of:
 *   throw new Error("Something went wrong");
 *
 * Use:
 *   return err("Something went wrong");
 *   // or
 *   return Result.err("Something went wrong");
 */

/** @type {import("eslint").Rule.RuleModule} */
export default {
  meta: {
    type: "problem",
    docs: {
      description: "Prohibit throw statements in server code and enforce Result type usage",
      recommended: true,
    },
    messages: {
      noThrowStatement:
        "Do not use 'throw' in server code. Use Result type (err() or Result.err()) for error handling instead.",
    },
    schema: [],
  },

  create(context) {
    return {
      ThrowStatement(node) {
        context.report({
          node,
          messageId: "noThrowStatement",
        });
      },
    };
  },
};
