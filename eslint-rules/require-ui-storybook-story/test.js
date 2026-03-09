#!/usr/bin/env node

/**
 * Test script for require-ui-storybook-story ESLint rule
 */

const { execSync } = require("child_process");
const path = require("path");

console.log("Testing require-ui-storybook-story ESLint rule...\n");

const fixturesDir = path.join(__dirname, "fixtures", "src", "client", "components", "ui");

const validFile = path.join(fixturesDir, "Button.tsx");
const invalidFile = path.join(fixturesDir, "Input.tsx");

console.log("Test 1: Checking valid component (story exists)...");
try {
  execSync(`pnpm eslint ${validFile} --no-ignore`, {
    stdio: "pipe",
    encoding: "utf-8",
  });
  console.log("PASS: valid component has no errors\n");
} catch (error) {
  console.error("FAIL: valid component should not have errors but got:");
  console.error(error.stdout);
  process.exit(1);
}

console.log("Test 2: Checking invalid component (story missing)...");
let output = "";
try {
  execSync(`pnpm eslint ${invalidFile} --no-ignore`, {
    stdio: "pipe",
    encoding: "utf-8",
  });
  console.error("FAIL: invalid component should have errors but got none");
  process.exit(1);
} catch (error) {
  output = error.stdout + error.stderr;
}

const errorCount = (output.match(/custom\/require-ui-storybook-story/g) || []).length;

if (errorCount === 1) {
  console.log("PASS: invalid component has exactly 1 error as expected\n");
} else {
  console.error(`FAIL: invalid component should have 1 error but got ${errorCount}`);
  console.error(output);
  process.exit(1);
}

console.log("All tests passed");
