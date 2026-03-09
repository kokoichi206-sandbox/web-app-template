/**
 * @fileoverview Prohibit relative imports across architectural layers.
 *
 * This rule prevents using relative paths (../) to import across different architectural layers.
 * It enforces the use of absolute imports (@/*) for better maintainability.
 *
 * Bad:
 *   // In src/app/page.tsx
 *   import { foo } from '../../../server/usecases/foo';
 *
 * Good:
 *   // In src/app/page.tsx
 *   import { foo } from '@/server/handlers/foo';
 */

/** @type {import('eslint').Rule.RuleModule} */
export default {
  meta: {
    type: "problem",
    docs: {
      description: "Prohibit relative imports across architectural layers",
      category: "Best Practices",
      recommended: true,
    },
    messages: {
      noRelativeImportAcrossLayers:
        "Relative import across layers is not allowed. Import from '{{ fromLayer }}' to '{{ toLayer }}' should use absolute path like '@/server/handlers/*'.",
    },
    schema: [],
  },

  create(context) {
    return {
      ImportDeclaration(node) {
        const importSource = node.source.value;

        // Only check relative imports that go up directories
        if (!importSource.startsWith("../")) {
          return;
        }

        const filename = context.filename || context.getFilename();
        const normalizedFilename = filename.replace(/\\/g, "/");

        // Detect source layer
        const fromLayer = detectLayer(normalizedFilename);
        if (!fromLayer) {
          return;
        }

        // Detect target layer from import path segments
        // Parse the relative path to find layer identifiers
        const toLayer = detectLayerFromImportPath(importSource);
        if (!toLayer) {
          return;
        }

        // Check if crossing between different major layers
        if (isLayerCrossing(fromLayer, toLayer)) {
          context.report({
            node: node.source,
            messageId: "noRelativeImportAcrossLayers",
            data: {
              fromLayer,
              toLayer,
            },
          });
        }
      },
    };
  },
};

/**
 * Detect the architectural layer from file path.
 * @param {string} filepath - The file path to analyze
 * @returns {string | null} - The detected layer or null
 */
function detectLayer(filepath) {
  if (filepath.includes("/src/app/")) return "app";
  if (filepath.includes("/src/client/")) return "client";
  if (filepath.includes("/src/server/")) return "server";
  if (filepath.includes("/src/shared/")) return "shared";
  if (filepath.includes("/src/types/")) return "types";
  return null;
}

/**
 * Detect the architectural layer from import path segments.
 * @param {string} importPath - The relative import path (e.g., "../../../server/usecases/foo")
 * @returns {string | null} - The detected layer or null
 */
function detectLayerFromImportPath(importPath) {
  // Split the path and find layer identifiers
  const segments = importPath.split("/");

  // Look for layer names in the path segments
  for (const segment of segments) {
    if (segment === "app") return "app";
    if (segment === "client") return "client";
    if (segment === "server") return "server";
    if (segment === "shared") return "shared";
    if (segment === "types") return "types";
  }

  return null;
}

/**
 * Check if importing across different major layers.
 * @param {string} fromLayer - The source layer
 * @param {string} toLayer - The target layer
 * @returns {boolean} - True if crossing layers
 */
function isLayerCrossing(fromLayer, toLayer) {
  // Same layer is allowed
  if (fromLayer === toLayer) {
    return false;
  }

  // shared and types can be imported from anywhere
  if (toLayer === "shared" || toLayer === "types") {
    return false;
  }

  // app/client -> server is not allowed (should use handlers)
  if ((fromLayer === "app" || fromLayer === "client") && toLayer === "server") {
    return true;
  }

  // Cross-layer imports between app/client are not allowed
  if (
    (fromLayer === "app" && toLayer === "client") ||
    (fromLayer === "client" && toLayer === "app")
  ) {
    return true;
  }

  return false;
}
