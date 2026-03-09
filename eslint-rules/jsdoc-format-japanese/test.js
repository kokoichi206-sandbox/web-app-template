#!/usr/bin/env node

/**
 * Tests for jsdoc-format-japanese ESLint rule
 */
import { RuleTester } from "eslint";
import rule from "./rule.js";

const ruleTester = new RuleTester({
  languageOptions: {
    ecmaVersion: 2020,
    sourceType: "module",
  },
});

ruleTester.run("jsdoc-format-japanese", rule, {
  valid: [
    // ==========================================
    // Correct: Japanese description with "。"
    // ==========================================
    {
      code: `
/**
 * ユーザー起因のエラーかどうかを判定。
 */
function isUserError() {}
      `,
      filename: "/project/src/example.ts",
    },

    // ==========================================
    // Correct: Bullet list with blank line before
    // ==========================================
    {
      code: `
/**
 * ユーザー起因のエラーかどうかを判定。
 *
 * - ユーザー起因: unauthorized, validation_error
 * - サーバー起因: db_error, api_error
 */
function isUserError() {}
      `,
      filename: "/project/src/example.ts",
    },

    // ==========================================
    // English comments (not checked)
    // ==========================================
    {
      code: `
/**
 * Check if error is user-caused
 */
function isUserError() {}
      `,
      filename: "/project/src/example.ts",
    },

    // ==========================================
    // Multiple paragraphs with proper formatting
    // ==========================================
    {
      code: `
/**
 * エラーログを最上流に集約。
 *
 * ユーザー起因のエラーは warn レベルで記録。
 *
 * - unauthorized: 認証エラー
 * - validation_error: バリデーションエラー
 */
function logError() {}
      `,
      filename: "/project/src/example.ts",
    },

    // ==========================================
    // JSDoc with @tags
    // ==========================================
    {
      code: `
/**
 * ユーザー情報を取得。
 *
 * @param userId - ユーザーID
 * @returns ユーザー情報
 */
function getUser(userId) {}
      `,
      filename: "/project/src/example.ts",
    },

    // ==========================================
    // Empty description (not checked)
    // ==========================================
    {
      code: `
/**
 * @param userId - User ID
 */
function getUser(userId) {}
      `,
      filename: "/project/src/example.ts",
    },

    // ==========================================
    // Non-JSDoc comments (not checked)
    // ==========================================
    {
      code: `
// ユーザー起因のエラーかどうかを判定
function isUserError() {}
      `,
      filename: "/project/src/example.ts",
    },

    // ==========================================
    // Correct: No duplicate punctuation
    // ==========================================
    {
      code: `
/**
 * dev 版 (mock) フォーマットに準拠。
 */
function createSheet() {}
      `,
      filename: "/project/src/example.ts",
    },
  ],

  invalid: [
    // ==========================================
    // Missing "。" at the end
    // ==========================================
    {
      code: `
/**
 * ユーザー起因のエラーかどうかを判定
 */
function isUserError() {}
      `,
      filename: "/project/src/example.ts",
      errors: [{ messageId: "missingPeriod" }],
      output: `
/**
 * ユーザー起因のエラーかどうかを判定。
 */
function isUserError() {}
      `,
    },

    // ==========================================
    // Missing blank line before bullet list
    // ==========================================
    {
      code: `
/**
 * ユーザー起因のエラーかどうかを判定。
 * - ユーザー起因: unauthorized, validation_error
 * - サーバー起因: db_error, api_error
 */
function isUserError() {}
      `,
      filename: "/project/src/example.ts",
      errors: [{ messageId: "missingBlankLineBeforeBullet" }],
      output: `
/**
 * ユーザー起因のエラーかどうかを判定。
 *
 * - ユーザー起因: unauthorized, validation_error
 * - サーバー起因: db_error, api_error
 */
function isUserError() {}
      `,
    },

    // ==========================================
    // Both issues: missing "。" and blank line
    // ==========================================
    {
      code: `
/**
 * ユーザー起因のエラーかどうかを判定
 * - ユーザー起因: unauthorized
 * - サーバー起因: db_error
 */
function isUserError() {}
      `,
      filename: "/project/src/example.ts",
      errors: [{ messageId: "missingPeriod" }, { messageId: "missingBlankLineBeforeBullet" }],
      // Note: ESLint applies fixes sequentially, so we only show the first fix
      output: `
/**
 * ユーザー起因のエラーかどうかを判定。
 * - ユーザー起因: unauthorized
 * - サーバー起因: db_error
 */
function isUserError() {}
      `,
    },

    // ==========================================
    // Multiple issues: missing period on last description line
    // ==========================================
    {
      code: `
/**
 * エラーログを最上流に集約
 *
 * ユーザー起因のエラーは warn レベルで記録
 * - unauthorized: 認証エラー
 * - validation_error: バリデーションエラー
 */
function logError() {}
      `,
      filename: "/project/src/example.ts",
      errors: [{ messageId: "missingPeriod" }, { messageId: "missingBlankLineBeforeBullet" }],
      // Note: ESLint applies the first fix, so only period is added
      output: `
/**
 * エラーログを最上流に集約
 *
 * ユーザー起因のエラーは warn レベルで記録。
 * - unauthorized: 認証エラー
 * - validation_error: バリデーションエラー
 */
function logError() {}
      `,
    },

    // ==========================================
    // Duplicate punctuation: colon + period (:。)
    // ==========================================
    {
      code: `
/**
 * dev 版 (mock) フォーマットに準拠:。
 */
function createSheet() {}
      `,
      filename: "/project/src/example.ts",
      errors: [{ messageId: "duplicatePunctuation" }],
      output: `
/**
 * dev 版 (mock) フォーマットに準拠。
 */
function createSheet() {}
      `,
    },

    // ==========================================
    // Duplicate punctuation: semicolon + period (;。)
    // ==========================================
    {
      code: `
/**
 * 処理が完了;。
 */
function finish() {}
      `,
      filename: "/project/src/example.ts",
      errors: [{ messageId: "duplicatePunctuation" }],
      output: `
/**
 * 処理が完了。
 */
function finish() {}
      `,
    },

    // ==========================================
    // Duplicate punctuation: Japanese comma + period (、。)
    // ==========================================
    {
      code: `
/**
 * データを取得、。
 */
function getData() {}
      `,
      filename: "/project/src/example.ts",
      errors: [{ messageId: "duplicatePunctuation" }],
      output: `
/**
 * データを取得。
 */
function getData() {}
      `,
    },
  ],
});

// eslint-disable-next-line no-console
console.log("All tests passed! ✨");
