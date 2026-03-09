/**
 * ESLint rule to enforce file naming conventions
 *
 * Rules:
 * - Route directory names (containing page.tsx): kebab-case (xxx-bbb)
 * - .tsx files: PascalCase (except Next.js special files)
 * - .ts files: kebab-case
 * - index.ts / index.tsx: allowed
 *
 * Next.js special files (allowed as lowercase):
 * page, layout, loading, error, not-found, template, default, route,
 * middleware, instrumentation, global-error, opengraph-image, twitter-image,
 * sitemap, robots, icon, apple-icon, manifest
 */

const NEXTJS_SPECIAL_FILES = new Set([
  "page",
  "layout",
  "loading",
  "error",
  "not-found",
  "template",
  "default",
  "route",
  "middleware",
  "instrumentation",
  "global-error",
  "opengraph-image",
  "twitter-image",
  "sitemap",
  "robots",
  "icon",
  "apple-icon",
  "manifest",
]);

const KEBAB_CASE_REGEX = /^[a-z][a-z0-9]*(-[a-z0-9]+)*$/;
const PASCAL_CASE_REGEX = /^[A-Z][a-zA-Z0-9]*$/;

/**
 * Check if a string is in kebab-case
 * @param {string} str
 * @returns {boolean}
 */
function isKebabCase(str) {
  return KEBAB_CASE_REGEX.test(str);
}

/**
 * Check if a string is in PascalCase
 * @param {string} str
 * @returns {boolean}
 */
function isPascalCase(str) {
  return PASCAL_CASE_REGEX.test(str);
}

/**
 * Extract filename without extension
 * @param {string} filename
 * @returns {string}
 */
function getBasename(filename) {
  const parts = filename.split("/").pop() || filename.split("\\").pop() || "";
  // Handle extensions like .test.ts, .stories.tsx
  const match = parts.match(/^([^.]+)/);
  return match ? match[1] : parts;
}

/**
 * Get file extension
 * @param {string} filename
 * @returns {string}
 */
function getExtension(filename) {
  const parts = filename.split("/").pop() || filename.split("\\").pop() || "";
  const dotIndex = parts.indexOf(".");
  return dotIndex !== -1 ? parts.slice(dotIndex) : "";
}

/**
 * Get the immediate parent directory name from a path
 * @param {string} filepath
 * @returns {string}
 */
function getParentDirectory(filepath) {
  const normalized = filepath.replace(/\\/g, "/");
  const parts = normalized.split("/").filter((part) => part && part !== ".");
  // Return the second-to-last part (parent directory of the file)
  return parts.length >= 2 ? parts[parts.length - 2] : "";
}

/** @type {import("eslint").Rule.RuleModule} */
export default {
  meta: {
    type: "problem",
    docs: {
      description: "Enforce file naming conventions",
      recommended: true,
    },
    messages: {
      invalidRouteDirectoryName:
        "Route directory name '{{name}}' must be in kebab-case (e.g., '{{suggestion}}')",
      invalidTsxFileName: "TSX file name '{{name}}' must be in PascalCase (e.g., '{{suggestion}}')",
      invalidTsFileName: "TS file name '{{name}}' must be in kebab-case (e.g., '{{suggestion}}')",
    },
    schema: [],
  },

  create(context) {
    const filename = context.filename || context.getFilename();

    // Skip node_modules and files outside src/
    if (filename.includes("node_modules") || !filename.includes("/src/")) {
      return {};
    }

    return {
      Program(node) {
        const basename = getBasename(filename);
        const extension = getExtension(filename);

        // Allow index files
        if (basename === "index") {
          return;
        }

        // Check route directory name (only for page.tsx files)
        if (basename === "page" && extension.endsWith(".tsx")) {
          const parentDir = getParentDirectory(filename);

          // Skip special Next.js directory patterns
          const isSpecialDir =
            !parentDir ||
            parentDir === "app" ||
            (parentDir.startsWith("[") && parentDir.endsWith("]")) ||
            parentDir.startsWith("_") ||
            (parentDir.startsWith("(") && parentDir.endsWith(")")) ||
            parentDir.startsWith("@");

          if (!isSpecialDir && !isKebabCase(parentDir)) {
            const suggestion = parentDir
              .replace(/([a-z])([A-Z])/g, "$1-$2")
              .replace(/_/g, "-")
              .toLowerCase();
            context.report({
              node,
              messageId: "invalidRouteDirectoryName",
              data: {
                name: parentDir,
                suggestion,
              },
              loc: { line: 1, column: 0 },
            });
          }
        }

        // Check file names based on extension
        if (extension.endsWith(".tsx")) {
          // TSX files: PascalCase (except Next.js special files)
          if (!NEXTJS_SPECIAL_FILES.has(basename) && !isPascalCase(basename)) {
            const suggestion = basename
              .split("-")
              .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
              .join("");
            context.report({
              node,
              messageId: "invalidTsxFileName",
              data: {
                name: basename,
                suggestion,
              },
              loc: { line: 1, column: 0 },
            });
          }
        } else if (extension.endsWith(".ts")) {
          // TS files: kebab-case
          if (!isKebabCase(basename)) {
            const suggestion = basename
              .replace(/([a-z])([A-Z])/g, "$1-$2")
              .replace(/_/g, "-")
              .toLowerCase();
            context.report({
              node,
              messageId: "invalidTsFileName",
              data: {
                name: basename,
                suggestion,
              },
              loc: { line: 1, column: 0 },
            });
          }
        }
      },
    };
  },
};
