/**
 * max-params-with-object ルールのテスト
 */
import { RuleTester } from "eslint";
import rule from "./rule.js";

const ruleTester = new RuleTester({
  languageOptions: {
    ecmaVersion: 2022,
    sourceType: "module",
  },
});

ruleTester.run("max-params-with-object", rule, {
  valid: [
    // 単一オブジェクトパラメータ (推奨パターン)
    {
      code: "function createUser({ name, email, age, role }) {}",
    },
    // オブジェクトパラメータを持つアロー関数
    {
      code: "const createUser = ({ name, email, age, role }) => {}",
    },
    // 最大値以内 (デフォルト 3)
    {
      code: "function add(a, b, c) {}",
    },
    // ちょうど最大値
    {
      code: "function greet(name, greeting, punctuation) {}",
    },
    // 最大値未満
    {
      code: "function add(a, b) {}",
    },
    // 単一パラメータ
    {
      code: "function getName(user) {}",
    },
    // パラメータなし
    {
      code: "function noArgs() {}",
    },
    // カスタム max オプション - 制限内
    {
      code: "function manyArgs(a, b, c, d, e) {}",
      options: [{ max: 5 }],
    },
    // 最大値以内のアロー関数
    {
      code: "const fn = (a, b, c) => a + b + c",
    },
    // オブジェクトパラメータを持つメソッド
    {
      code: `
        const obj = {
          method({ a, b, c, d }) {
            return a + b + c + d;
          }
        }
      `,
    },
    // オブジェクトパラメータを持つクラスメソッド
    {
      code: `
        class MyClass {
          process({ input, config, options, callback }) {
            return input;
          }
        }
      `,
    },
    // array.map 内のコールバック (デフォルトで無視)
    {
      code: "[].map((item, index, array, extra) => item)",
    },
    // array.reduce 内のコールバック (デフォルトで無視)
    {
      code: "[].reduce((acc, item, index, array) => acc, {})",
    },
    // array.filter 内のコールバック (デフォルトで無視)
    {
      code: "[].filter(function(item, index, array, extra) { return true })",
    },
    // forEach 内のコールバック (デフォルトで無視)
    {
      code: "[].forEach((a, b, c, d) => {})",
    },
    // カスタム関数呼び出し内のコールバック (デフォルトで無視)
    {
      code: "customFn((a, b, c, d) => a + b + c + d)",
    },
    // Promise コンストラクタ内のコールバック (デフォルトで無視)
    {
      code: "new Promise((resolve, reject, extra1, extra2) => {})",
    },
    // ignoreCallbacks を明示的に true に設定したコールバック
    {
      code: "[].map((a, b, c, d) => a)",
      options: [{ ignoreCallbacks: true }],
    },
    // チェーン呼び出し内の複数のコールバック
    {
      code: "[].map((a, b, c, d) => a).filter((x, y, z, w) => true)",
    },
  ],

  invalid: [
    // デフォルトの最大値 (3) を超過
    {
      code: "function createUser(name, email, age, role) {}",
      errors: [
        {
          messageId: "tooManyParams",
          data: { name: "createUser", count: 4, max: 3 },
        },
      ],
    },
    // 最大値を超過するアロー関数
    {
      code: "const createUser = (name, email, age, role) => {}",
      errors: [
        {
          messageId: "tooManyParams",
          data: { name: "createUser", count: 4, max: 3 },
        },
      ],
    },
    // カスタム max オプションを超過
    {
      code: "function manyArgs(a, b, c) {}",
      options: [{ max: 2 }],
      errors: [
        {
          messageId: "tooManyParams",
          data: { name: "manyArgs", count: 3, max: 2 },
        },
      ],
    },
    // 多数のパラメータ
    {
      code: "function tooMany(a, b, c, d, e, f) {}",
      errors: [
        {
          messageId: "tooManyParams",
          data: { name: "tooMany", count: 6, max: 3 },
        },
      ],
    },
    // メソッド定義
    {
      code: `
        const obj = {
          method(a, b, c, d) {
            return a + b + c + d;
          }
        }
      `,
      errors: [
        {
          messageId: "tooManyParams",
          data: { name: "method", count: 4, max: 3 },
        },
      ],
    },
    // 変数に代入された関数式
    {
      code: "const handler = function(req, res, next, extra) {}",
      errors: [
        {
          messageId: "tooManyParams",
          data: { name: "handler", count: 4, max: 3 },
        },
      ],
    },
    // ignoreCallbacks を明示的に false に設定したコールバック
    {
      code: "[].map((item, index, array, extra) => item)",
      options: [{ ignoreCallbacks: false }],
      errors: [
        {
          messageId: "tooManyParamsAnonymous",
          data: { count: 4, max: 3 },
        },
      ],
    },
    // ignoreCallbacks が false の場合のコールバック関数式
    {
      code: "[].filter(function(a, b, c, d) { return true })",
      options: [{ ignoreCallbacks: false }],
      errors: [
        {
          messageId: "tooManyParamsAnonymous",
          data: { count: 4, max: 3 },
        },
      ],
    },
  ],
});

console.log("全テスト合格!");
