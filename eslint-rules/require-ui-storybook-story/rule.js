/**
 * ESLint rule to require Storybook stories for UI components.
 *
 * Target:
 * - .tsx files under src/client/components/ui
 *
 * Exclusions:
 * - *.stories.tsx
 * - *.test.tsx
 * - *.spec.tsx
 * - index.tsx
 */

import fs from "node:fs";
import path from "node:path";

const UI_COMPONENTS_PATH = "/src/client/components/ui/";

/**
 * @param {string} filename
 * @returns {boolean}
 */
function isTargetUiComponent(filename) {
  const normalized = filename.replace(/\\/g, "/");

  if (!normalized.includes(UI_COMPONENTS_PATH)) {
    return false;
  }

  if (!normalized.endsWith(".tsx")) {
    return false;
  }

  if (
    normalized.endsWith(".stories.tsx") ||
    normalized.endsWith(".test.tsx") ||
    normalized.endsWith(".spec.tsx")
  ) {
    return false;
  }

  return path.basename(normalized) !== "index.tsx";
}

/**
 * @param {string} componentFile
 * @returns {string}
 */
function getStoryPath(componentFile) {
  const dir = path.dirname(componentFile);
  const ext = path.extname(componentFile);
  const base = path.basename(componentFile, ext);
  return path.join(dir, `${base}.stories.tsx`);
}

/** @type {import("eslint").Rule.RuleModule} */
export default {
  meta: {
    type: "problem",
    docs: {
      description: "Require Storybook stories for UI components under src/client/components/ui",
      recommended: true,
    },
    schema: [],
    messages: {
      missingStory:
        "UI component '{{component}}' must have a Storybook file '{{storyFile}}' in the same directory.",
    },
  },

  create(context) {
    const filename = context.filename || context.getFilename();

    if (!filename || filename === "<input>" || !isTargetUiComponent(filename)) {
      return {};
    }

    return {
      Program(node) {
        const storyPath = getStoryPath(filename);
        if (fs.existsSync(storyPath)) {
          return;
        }

        context.report({
          node,
          messageId: "missingStory",
          data: {
            component: path.basename(filename),
            storyFile: path.basename(storyPath),
          },
          loc: { line: 1, column: 0 },
        });
      },
    };
  },
};
