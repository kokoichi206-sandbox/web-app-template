/**
 * @fileoverview Prohibit magic strings in SQL queries.
 *
 * This rule detects string literals used in ORM query conditions
 * and suggests using constants or typed variables instead.
 *
 * Bad:
 *   db.select().from(users).where(eq(users.status, 'active'));
 *
 * Good:
 *   const USER_STATUS_ACTIVE = 'active' as const;
 *   db.select().from(users).where(eq(users.status, USER_STATUS_ACTIVE));
 *
 *   // Or with type
 *   type UserStatus = 'active' | 'inactive';
 *   const status: UserStatus = 'active';
 *   db.select().from(users).where(eq(users.status, status));
 */

/** @type {import('eslint').Rule.RuleModule} */
export default {
  meta: {
    type: "suggestion",
    docs: {
      description: "Prohibit magic strings in SQL queries",
      category: "Best Practices",
      recommended: false,
    },
    messages: {
      noMagicStringInSQL:
        "Avoid using magic string '{{ value }}' in SQL query. Consider using a constant or typed variable.",
    },
    schema: [],
  },

  create(context) {
    // ORM condition functions that commonly use string literals
    const CONDITION_FUNCTIONS = new Set([
      "eq",
      "ne",
      "gt",
      "gte",
      "lt",
      "lte",
      "like",
      "ilike",
      "notLike",
      "notIlike",
      "inArray",
      "notInArray",
    ]);

    // Exceptions: These are commonly unique identifiers or emails
    const ALLOWED_PATTERNS = [
      /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, // Email
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i, // UUID
    ];

    return {
      CallExpression(node) {
        // Check if this is an ORM condition function
        if (node.callee.type !== "Identifier" || !CONDITION_FUNCTIONS.has(node.callee.name)) {
          return;
        }

        // Check arguments for string literals
        for (const arg of node.arguments) {
          if (arg.type === "Literal" && typeof arg.value === "string") {
            // Skip allowed patterns (email, UUID, etc.)
            if (ALLOWED_PATTERNS.some((pattern) => pattern.test(arg.value))) {
              continue;
            }

            context.report({
              node: arg,
              messageId: "noMagicStringInSQL",
              data: {
                value: arg.value,
              },
            });
          }
        }
      },
    };
  },
};
