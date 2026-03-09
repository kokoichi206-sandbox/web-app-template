/**
 * @fileoverview Enforce proper error handling patterns in try-catch blocks.
 *
 * This rule ensures that errors caught in try-catch blocks are properly handled:
 * - Either logged and re-thrown
 * - Or returned as Result type (err())
 *
 * Bad:
 *   try {
 *     await operation();
 *   } catch (e) {
 *     console.error(e); // Error is ignored
 *   }
 *
 * Good:
 *   try {
 *     await operation();
 *   } catch (e) {
 *     logger.error({ error: e }, 'Operation failed');
 *     throw e; // or return err(e)
 *   }
 */

/** @type {import('eslint').Rule.RuleModule} */
export default {
  meta: {
    type: "problem",
    docs: {
      description: "Enforce proper error handling patterns in try-catch blocks",
      category: "Best Practices",
      recommended: true,
    },
    messages: {
      missingErrorPropagation:
        "Caught error must be propagated. Either throw the error or return it as Result type (err()).",
      useLoggerNotConsole: "Use logger.error() instead of console.error() for error logging.",
    },
    schema: [],
  },

  create(context) {
    return {
      CatchClause(node) {
        const filename = context.filename || context.getFilename();

        // Only check src/server/ files
        if (!filename.includes("/src/server/")) {
          return;
        }

        // Check if the catch block properly handles the error
        const hasThrow = hasThrowStatement(node.body);
        const hasReturn = hasReturnStatement(node.body);
        const hasConsoleError = hasConsoleErrorCall(node.body);

        // Error must be either thrown or returned
        if (!hasThrow && !hasReturn) {
          context.report({
            node: node,
            messageId: "missingErrorPropagation",
          });
        }

        // Should use logger.error instead of console.error
        if (hasConsoleError) {
          context.report({
            node: node,
            messageId: "useLoggerNotConsole",
          });
        }
      },
    };
  },
};

/**
 * Check if block statement contains throw statement.
 * @param {import('eslint').Rule.Node} node - The node to check
 * @returns {boolean} - True if throw statement exists
 */
function hasThrowStatement(node) {
  if (!node || !node.body) return false;

  for (const statement of node.body) {
    if (statement.type === "ThrowStatement") {
      return true;
    }
    // Check nested blocks (if, switch, etc.)
    if (statement.type === "IfStatement") {
      if (hasThrowStatement(statement.consequent) || hasThrowStatement(statement.alternate)) {
        return true;
      }
    }
    if (statement.type === "BlockStatement") {
      if (hasThrowStatement(statement)) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Check if block statement contains return statement.
 * @param {import('eslint').Rule.Node} node - The node to check
 * @returns {boolean} - True if return statement exists
 */
function hasReturnStatement(node) {
  if (!node || !node.body) return false;

  for (const statement of node.body) {
    if (statement.type === "ReturnStatement") {
      return true;
    }
    // Check nested blocks
    if (statement.type === "IfStatement") {
      if (hasReturnStatement(statement.consequent) || hasReturnStatement(statement.alternate)) {
        return true;
      }
    }
    if (statement.type === "BlockStatement") {
      if (hasReturnStatement(statement)) {
        return true;
      }
    }
  }

  return false;
}

/**
 * Check if block statement contains console.error call.
 * @param {import('eslint').Rule.Node} node - The node to check
 * @returns {boolean} - True if console.error call exists
 */
function hasConsoleErrorCall(node) {
  if (!node || !node.body) return false;

  for (const statement of node.body) {
    if (statement.type === "ExpressionStatement") {
      const expr = statement.expression;
      if (
        expr.type === "CallExpression" &&
        expr.callee.type === "MemberExpression" &&
        expr.callee.object.name === "console" &&
        expr.callee.property.name === "error"
      ) {
        return true;
      }
    }
    // Check nested blocks
    if (statement.type === "IfStatement") {
      if (hasConsoleErrorCall(statement.consequent) || hasConsoleErrorCall(statement.alternate)) {
        return true;
      }
    }
    if (statement.type === "BlockStatement") {
      if (hasConsoleErrorCall(statement)) {
        return true;
      }
    }
  }

  return false;
}
