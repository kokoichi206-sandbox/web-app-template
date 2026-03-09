#!/usr/bin/env node

/**
 * Test script for max-api-route-handler-lines ESLint rule
 */

const { execSync } = require("child_process");
const path = require("path");

console.log("Testing max-api-route-handler-lines ESLint rule...\n");

const fixturesDir = path.join(__dirname, "fixtures");
const validFile = path.join(fixturesDir, "src/app/api/valid/route.ts");
const invalidFile = path.join(fixturesDir, "src/app/api/invalid/route.ts");

// Test 1: valid route.ts should have no errors
console.log("Test 1: Checking valid route.ts (should have no errors)...");
try {
  execSync(`pnpm eslint ${validFile} --no-ignore`, {
    stdio: "pipe",
    encoding: "utf-8",
  });
  console.log("✅ PASS: valid route.ts has no errors\n");
} catch (error) {
  console.error("❌ FAIL: valid route.ts should not have errors but got:");
  console.error(error.stdout);
  process.exit(1);
}

// Test 2: invalid route.ts should have exactly 1 error
console.log("Test 2: Checking invalid route.ts (should have 1 error)...");
let output = "";
try {
  output = execSync(`pnpm eslint ${invalidFile} --no-ignore`, {
    encoding: "utf-8",
  });
  console.error("❌ FAIL: invalid route.ts should have errors but got none");
  process.exit(1);
} catch (error) {
  output = error.stdout + error.stderr;
}

const errorCount = (output.match(/custom\/max-api-route-handler-lines/g) || []).length;

if (errorCount === 1) {
  console.log("✅ PASS: invalid route.ts has exactly 1 error as expected\n");
} else {
  console.error(`❌ FAIL: invalid route.ts should have 1 error but got ${errorCount}`);
  console.error(output);
  process.exit(1);
}

console.log("All tests passed! ✨");
