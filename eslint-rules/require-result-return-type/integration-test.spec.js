/**
 * Integration test for require-result-return-type ESLint rule
 *
 * This test uses actual TypeScript files in the fixtures directory
 * and runs ESLint with full type-checking enabled.
 */

import { ESLint } from "eslint";
import path from "path";
import { fileURLToPath } from "url";
import { describe, expect, it } from "vitest";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe("require-result-return-type integration tests", () => {
  const projectRoot = process.cwd();
  const fixturesDir = path.join(projectRoot, "src/server/usecases/__test-fixtures__");

  it("should pass for valid.ts with correct Result types", async () => {
    const eslint = new ESLint({
      overrideConfigFile: path.join(projectRoot, "eslint.config.mjs"),
      cwd: projectRoot,
      ignore: false, // Don't ignore __test-fixtures__
    });

    const validResults = await eslint.lintFiles([path.join(fixturesDir, "valid.ts")]);
    const validErrors = validResults[0]?.messages || [];

    expect(validErrors).toHaveLength(0);
  });

  it("should report errors for invalid.ts with incorrect return types", async () => {
    const eslint = new ESLint({
      overrideConfigFile: path.join(projectRoot, "eslint.config.mjs"),
      cwd: projectRoot,
      ignore: false, // Don't ignore __test-fixtures__
    });

    const invalidResults = await eslint.lintFiles([path.join(fixturesDir, "invalid.ts")]);
    const invalidErrors =
      invalidResults[0]?.messages.filter(
        (msg) => msg.ruleId === "custom/require-result-return-type"
      ) || [];

    expect(invalidErrors.length).toBeGreaterThan(0);
    expect(invalidErrors).toHaveLength(8); // We expect 8 errors from invalid.ts
  });
});
