#!/usr/bin/env node

/**
 * Tests for require-result-return-type ESLint rule
 *
 * Note: This rule requires type-aware linting. Tests use a simplified
 * approach that mocks the TypeScript services.
 */
import { RuleTester } from "eslint";
import rule from "./rule.js";

// Basic RuleTester for non-type-aware tests
const ruleTester = new RuleTester({
  languageOptions: {
    ecmaVersion: 2020,
    sourceType: "module",
  },
});

// Test that rule is skipped for non-target directories
ruleTester.run("require-result-return-type (non-target directories)", rule, {
  valid: [
    // Not in usecases or handlers - should be ignored
    {
      code: `export function getData() { return "string"; }`,
      filename: "/project/src/client/utils/data.ts",
    },
    {
      code: `export const fetchData = () => fetch('/api');`,
      filename: "/project/src/lib/fetcher.ts",
    },
    // In repository - should be ignored
    {
      code: `export function findUser() { return null; }`,
      filename: "/project/src/server/repositories/user.ts",
    },
  ],
  invalid: [],
});

// eslint-disable-next-line no-console
console.log("Basic tests passed! ✨");

// Note: Type-aware tests are done in integration-test.spec.js with real TypeScript files
