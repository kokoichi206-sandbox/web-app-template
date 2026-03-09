/**
 * ESLint rule to require Result return type in usecases and handlers
 *
 * This rule ensures that exported functions in src/server/usecases/ and
 * src/server/handlers/ directories return a Result type.
 *
 * Requires type-aware linting (parserOptions.project must be set).
 */

/** @type {import("eslint").Rule.RuleModule} */
export default {
  meta: {
    type: "problem",
    docs: {
      description: "Require Result return type in usecases and handlers",
      recommended: true,
    },
    messages: {
      missingResultType:
        "Exported function '{{name}}' must return Result<T, E> or Promise<Result<T, E>>. Current return type: {{actualType}}",
      missingResultTypeMethod:
        "Exported method '{{name}}' must return Result<T, E> or Promise<Result<T, E>>. Current return type: {{actualType}}",
    },
    schema: [],
  },

  create(context) {
    const filename = context.filename || context.getFilename();

    // Only apply to files in src/server/usecases/ or src/server/handlers/
    const isTargetDirectory =
      filename.includes("/src/server/usecases/") ||
      filename.includes("/src/server/handlers/") ||
      filename.includes("\\src\\server\\usecases\\") ||
      filename.includes("\\src\\server\\handlers\\");

    if (!isTargetDirectory) {
      return {};
    }

    // Get TypeScript parser services
    const parserServices = context.sourceCode?.parserServices ?? context.parserServices;

    if (!parserServices?.program || !parserServices?.esTreeNodeToTSNodeMap) {
      // Type information not available - skip this rule
      return {};
    }

    const checker = parserServices.program.getTypeChecker();
    const esTreeNodeToTSNodeMap = parserServices.esTreeNodeToTSNodeMap;

    /**
     * Check if a type is Result or Promise<Result>
     */
    function isResultType(type) {
      const typeString = checker.typeToString(type);

      // Direct Result type
      if (typeString.startsWith("Result<")) {
        return true;
      }

      // Promise<Result<...>>
      if (typeString.startsWith("Promise<Result<")) {
        return true;
      }

      // Check the actual type structure for more complex cases
      const symbol = type.getSymbol?.() || type.aliasSymbol;
      if (symbol) {
        const name = symbol.getName();
        if (name === "Result") {
          return true;
        }
        if (name === "Promise") {
          // Check type arguments for Promise
          const typeArgs = type.typeArguments ?? type.resolvedTypeArguments;
          if (typeArgs && typeArgs.length > 0) {
            return isResultType(typeArgs[0]);
          }
        }
      }

      return false;
    }

    /**
     * Get the return type of a function node
     */
    function getReturnType(node) {
      try {
        const tsNode = esTreeNodeToTSNodeMap.get(node);
        if (!tsNode) return null;

        const signature = checker.getSignatureFromDeclaration(tsNode);
        if (!signature) return null;

        return checker.getReturnTypeOfSignature(signature);
      } catch {
        return null;
      }
    }

    /**
     * Check and report if function doesn't return Result
     */
    function checkFunction(node, name, messageId) {
      const returnType = getReturnType(node);
      if (!returnType) return;

      if (!isResultType(returnType)) {
        const typeString = checker.typeToString(returnType);
        context.report({
          node: node,
          messageId,
          data: {
            name,
            actualType: typeString,
          },
        });
      }
    }

    return {
      // Check exported function declarations (includes async functions)
      // export function foo() {}
      // export async function foo() {}
      "ExportNamedDeclaration > FunctionDeclaration"(node) {
        const name = node.id?.name ?? "anonymous";
        checkFunction(node, name, "missingResultType");
      },

      // Check exported variable declarations with arrow functions
      // export const foo = () => {}
      // export const foo = async () => {}
      "ExportNamedDeclaration > VariableDeclaration > VariableDeclarator"(node) {
        if (
          node.init &&
          (node.init.type === "ArrowFunctionExpression" || node.init.type === "FunctionExpression")
        ) {
          const name = node.id?.name ?? "anonymous";
          checkFunction(node.init, name, "missingResultType");
        }
      },

      // Check exported object with methods (like export const fooUsecase = { ... })
      "ExportNamedDeclaration > VariableDeclaration > VariableDeclarator > ObjectExpression > Property"(
        node
      ) {
        if (
          node.value &&
          (node.value.type === "ArrowFunctionExpression" ||
            node.value.type === "FunctionExpression")
        ) {
          const name = node.key?.name ?? node.key?.value ?? "anonymous";
          checkFunction(node.value, name, "missingResultTypeMethod");
        }
      },
    };
  },
};
