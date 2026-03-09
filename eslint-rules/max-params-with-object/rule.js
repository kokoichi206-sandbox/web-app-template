/**
 * 引数が多い関数に対して名前付きパラメータ (オブジェクト分割代入) を強制する ESLint ルール。
 *
 * 設定された数より多くの引数を持つ関数は、分割代入を使った単一のオブジェクトパラメータを
 * 使用する必要がある。
 *
 * 良い例:
 *   function createUser({ name, email, age }: CreateUserParams) { ... }
 *
 * 悪い例:
 *   function createUser(name: string, email: string, age: number) { ... }
 *
 * オプション:
 *   - max: オブジェクトパターンを必須とする引数の最大数 (デフォルト: 3)
 *   - ignoreCallbacks: 他の関数に渡されるコールバック関数をスキップする (デフォルト: true)
 */

/**
 * 関数がコールバックとして使用されていることを示す親ノードの種類。
 * @type {Set<string>}
 */
const CALLBACK_PARENT_TYPES = new Set([
  "CallExpression", // fn.map((a, b, c, d) => ...)
  "NewExpression", // new Promise((resolve, reject, ...) => ...)
]);

/**
 * CallExpression 内でコールバック使用を示す親プロパティの種類。
 * @type {Set<string>}
 */
const CALLBACK_PROPERTIES = new Set(["arguments", "callee"]);

/** @type {import("eslint").Rule.RuleModule} */
export default {
  meta: {
    type: "suggestion",
    docs: {
      description: "引数が多い関数に対してオブジェクトパラメータを強制する",
      recommended: true,
    },
    messages: {
      tooManyParams:
        "関数 '{{name}}' は {{count}} 個の引数を持っています。可読性向上のため、単一のオブジェクトパラメータの使用を検討してください。(最大: {{max}})",
      tooManyParamsAnonymous:
        "関数は {{count}} 個の引数を持っています。可読性向上のため、単一のオブジェクトパラメータの使用を検討してください。(最大: {{max}})",
    },
    schema: [
      {
        type: "object",
        properties: {
          max: {
            type: "integer",
            minimum: 1,
            default: 3,
          },
          ignoreCallbacks: {
            type: "boolean",
            default: true,
          },
        },
        additionalProperties: false,
      },
    ],
  },

  create(context) {
    const options = context.options[0] || {};
    const maxParams = options.max ?? 3;
    const ignoreCallbacks = options.ignoreCallbacks ?? true;

    /**
     * パラメータがオブジェクトパターン (分割代入) かどうかを確認する。
     * @param {import("estree").Pattern} param
     * @returns {boolean}
     */
    function isObjectPattern(param) {
      return param.type === "ObjectPattern";
    }

    /**
     * 関数が単一のオブジェクトパラメータパターンを使用しているかを確認する。
     * @param {Array<import("estree").Pattern>} params
     * @returns {boolean}
     */
    function usesSingleObjectParam(params) {
      // 引数が1つだけで、それがオブジェクトパターンの場合は推奨パターン
      if (params.length === 1 && isObjectPattern(params[0])) {
        return true;
      }
      return false;
    }

    /**
     * 関数がコールバック引数として使用されているかを確認する。
     * @param {import("estree").Node} node
     * @returns {boolean}
     */
    function isCallbackFunction(node) {
      const parent = node.parent;
      if (!parent) {
        return false;
      }

      // 直接コールバック: array.map((a, b, c, d) => ...)
      if (CALLBACK_PARENT_TYPES.has(parent.type)) {
        // この関数が引数であること (callee 自体ではない) を確認
        if (parent.type === "CallExpression" || parent.type === "NewExpression") {
          return parent.arguments && parent.arguments.includes(node);
        }
        return true;
      }

      // 配列要素コールバック: [].sort(function(a, b, c, d) {})
      if (parent.type === "ArrayExpression") {
        return true;
      }

      return false;
    }

    /**
     * エラーメッセージ用の関数名を取得する。
     * @param {import("estree").Node} node
     * @returns {string | null}
     */
    function getFunctionName(node) {
      if (node.id && node.id.name) {
        return node.id.name;
      }
      // 変数に代入されたアロー関数の場合
      if (node.parent && node.parent.type === "VariableDeclarator" && node.parent.id) {
        return node.parent.id.name;
      }
      // メソッド定義の場合
      if (node.parent && node.parent.type === "MethodDefinition" && node.parent.key) {
        return node.parent.key.name;
      }
      // プロパティ代入の場合
      if (node.parent && node.parent.type === "Property" && node.parent.key) {
        return node.parent.key.name;
      }
      return null;
    }

    /**
     * 関数のパラメータをチェックする。
     * @param {import("estree").Function} node
     */
    function checkFunction(node) {
      const params = node.params;

      // 推奨される単一オブジェクトパラメータパターンを使用している場合はスキップ
      if (usesSingleObjectParam(params)) {
        return;
      }

      // オプションが有効な場合、コールバック関数はスキップ
      if (ignoreCallbacks && isCallbackFunction(node)) {
        return;
      }

      // パラメータ数が最大値を超えているか確認
      if (params.length > maxParams) {
        const functionName = getFunctionName(node);

        if (functionName) {
          context.report({
            node,
            messageId: "tooManyParams",
            data: {
              name: functionName,
              count: params.length,
              max: maxParams,
            },
          });
        } else {
          context.report({
            node,
            messageId: "tooManyParamsAnonymous",
            data: {
              count: params.length,
              max: maxParams,
            },
          });
        }
      }
    }

    return {
      FunctionDeclaration: checkFunction,
      FunctionExpression: checkFunction,
      ArrowFunctionExpression: checkFunction,
    };
  },
};
