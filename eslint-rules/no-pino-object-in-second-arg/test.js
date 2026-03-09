#!/usr/bin/env node

/**
 * Test script for no-pino-object-in-second-arg ESLint rule
 */

const { execSync } = require("child_process");
const path = require("path");

console.log("Testing no-pino-object-in-second-arg ESLint rule...\n");

const fixturesDir = path.join(__dirname, "fixtures");

// Test 1: valid.ts should have no errors
console.log("Test 1: Checking valid.ts (should have no errors)...");
try {
  execSync(`pnpm eslint ${path.join(fixturesDir, "valid.ts")} --no-ignore`, {
    stdio: "pipe",
    encoding: "utf-8",
  });
  console.log("✅ PASS: valid.ts has no errors\n");
} catch (error) {
  console.error("❌ FAIL: valid.ts should not have errors but got:");
  console.error(error.stdout);
  process.exit(1);
}

// Test 2: invalid.ts should have exactly 7 errors
// - 4 errors for wrongOrder (message first, object second)
// - 3 errors for canonicalErrorKey (error, requestError, parseError instead of err)
console.log("Test 2: Checking invalid.ts (should have 7 errors)...");
let output = "";
try {
  output = execSync(`pnpm eslint ${path.join(fixturesDir, "invalid.ts")} --no-ignore`, {
    encoding: "utf-8",
  });
  console.error("❌ FAIL: invalid.ts should have errors but got none");
  process.exit(1);
} catch (error) {
  output = error.stdout + error.stderr;
}

const errorCount = (output.match(/custom\/no-pino-object-in-second-arg/g) || []).length;

if (errorCount === 7) {
  console.log("✅ PASS: invalid.ts has exactly 7 errors as expected\n");
} else {
  console.error(`❌ FAIL: invalid.ts should have 7 errors but got ${errorCount}`);
  console.error(output);
  process.exit(1);
}

console.log("All tests passed! ✨");
