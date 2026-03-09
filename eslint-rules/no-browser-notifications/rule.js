/**
 * ESLint rule to prohibit browser notification APIs
 *
 * This rule prohibits the use of browser's native notification APIs
 * (alert, confirm, prompt) and enforces the use of the project's
 * custom components instead.
 *
 * Prohibited APIs:
 * - window.alert() / alert()
 * - window.confirm() / confirm()
 * - window.prompt() / prompt()
 * - globalThis.alert() / globalThis.confirm() / globalThis.prompt()
 *
 * Recommended alternatives:
 * - Use useToast() hook from @/client/hooks/use-toast for notifications
 * - Use useConfirm() hook from @/client/hooks/use-confirm for confirmation dialogs
 *
 * Exceptions:
 * - Variables destructured from useConfirm are allowed
 *   (e.g., const { confirm } = useConfirm())
 *   (e.g., const { confirm: myConfirm } = useConfirm())
 */

/** @type {import("eslint").Rule.RuleModule} */
export default {
  meta: {
    type: "problem",
    docs: {
      description:
        "Prohibit browser notification APIs (alert, confirm, prompt) and enforce Toast usage",
      recommended: true,
    },
    messages: {
      noBrowserNotification:
        "Do not use '{{name}}()'. Use useToast() from '@/client/hooks/use-toast' for notifications or useConfirm() from '@/client/hooks/use-confirm' for confirmation dialogs.",
    },
    schema: [],
  },

  create(context) {
    const prohibitedFunctions = new Set(["alert", "confirm", "prompt"]);

    return {
      CallExpression(node) {
        let functionName = null;

        // Check for direct calls: alert(), confirm(), prompt()
        if (node.callee.type === "Identifier") {
          functionName = node.callee.name;

          // Check if prohibited
          if (!prohibitedFunctions.has(functionName)) {
            return;
          }

          // Check if this variable is defined in local scope from useConfirm
          const scope = context.sourceCode ? context.sourceCode.getScope(node) : context.getScope();

          // Look through all scopes from current to global
          let currentScope = scope;
          while (currentScope) {
            const variable = currentScope.set.get(functionName);
            if (variable && variable.defs.length > 0) {
              // Check if it's from useConfirm
              for (const def of variable.defs) {
                if (def.type === "Variable" && def.node && def.node.init) {
                  const init = def.node.init;
                  if (
                    init.type === "CallExpression" &&
                    init.callee.type === "Identifier" &&
                    init.callee.name === "useConfirm"
                  ) {
                    // This is from useConfirm, allow it
                    return;
                  }
                }
              }
              // Variable is defined but not from useConfirm, report it
              break;
            }
            currentScope = currentScope.upper;
          }
        }

        // Check for window.alert(), window.confirm(), window.prompt()
        // Also check globalThis.alert(), globalThis.confirm(), globalThis.prompt()
        // Support both property access (window.alert) and computed access (window['alert'])
        if (
          node.callee.type === "MemberExpression" &&
          node.callee.object.type === "Identifier" &&
          (node.callee.object.name === "window" || node.callee.object.name === "globalThis")
        ) {
          // Handle both property access and computed property access
          if (node.callee.property.type === "Identifier") {
            functionName = node.callee.property.name;
          } else if (node.callee.computed && node.callee.property.type === "Literal") {
            functionName = node.callee.property.value;
          }
        }

        if (functionName && prohibitedFunctions.has(functionName)) {
          context.report({
            node: node.callee,
            messageId: "noBrowserNotification",
            data: {
              name: functionName,
            },
          });
        }
      },
    };
  },
};
