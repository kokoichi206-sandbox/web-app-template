/**
 * ESLint rule to enforce Japanese JSDoc formatting standards
 *
 * This rule ensures that JSDoc comments follow Japanese formatting conventions:
 * 1. Description sentences must end with "。" (Japanese period)
 * 2. No duplicate punctuation before the period (e.g., ":。", ";。", ",。", "、。")
 * 3. Bullet list items (starting with "-") must have a blank line before them
 *
 * Based on PR #90 and PR #141 review feedback.
 */

/** @type {import("eslint").Rule.RuleModule} */
export default {
  meta: {
    type: "layout",
    docs: {
      description: "Enforce Japanese JSDoc formatting standards",
      recommended: true,
    },
    fixable: "code",
    messages: {
      missingPeriod: "JSDoc description must end with '。' (Japanese period).",
      missingBlankLineBeforeBullet:
        "Bullet list items must have a blank line before them in JSDoc comments.",
      duplicatePunctuation:
        "JSDoc description should not have duplicate punctuation (e.g., ':。' should be '。').",
    },
    schema: [],
  },

  create(context) {
    const sourceCode = context.sourceCode || context.getSourceCode();

    /**
     * Check if a string contains Japanese characters
     */
    function containsJapanese(text) {
      // Match Hiragana, Katakana, Kanji
      return /[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/.test(text);
    }

    /**
     * Get the description part of JSDoc comment (before @tags)
     */
    function getDescriptionLines(comment) {
      const lines = comment.value.split("\n").map((line) => line.trim().replace(/^\*\s?/, ""));

      const descriptionLines = [];
      for (const line of lines) {
        // Stop at @tags
        if (line.startsWith("@")) {
          break;
        }
        descriptionLines.push(line);
      }

      return descriptionLines;
    }

    /**
     * Find the last non-empty description line
     */
    function findLastDescriptionLine(lines) {
      for (let i = lines.length - 1; i >= 0; i--) {
        const line = lines[i].trim();
        // Skip empty lines and bullet list items
        if (line && !line.startsWith("-")) {
          return { line, index: i };
        }
      }
      return null;
    }

    /**
     * Check if line is a bullet list item
     */
    function isBulletLine(line) {
      return /^\s*-\s/.test(line);
    }

    return {
      Program() {
        const comments = sourceCode.getAllComments();

        for (const comment of comments) {
          // Only check JSDoc comments (block comments starting with **)
          if (comment.type !== "Block" || !comment.value.startsWith("*")) {
            continue;
          }

          const descriptionLines = getDescriptionLines(comment);
          if (descriptionLines.length === 0) {
            continue;
          }

          // Check 1: Description must end with "。"
          const lastDescLine = findLastDescriptionLine(descriptionLines);
          if (lastDescLine && containsJapanese(lastDescLine.line)) {
            const trimmed = lastDescLine.line.trim();

            // Check 1a: Duplicate punctuation (e.g., ":。")
            if (/[:;,、]。$/.test(trimmed)) {
              context.report({
                loc: comment.loc,
                messageId: "duplicatePunctuation",
                fix(fixer) {
                  const commentText = comment.value;
                  const lines = commentText.split("\n");

                  // Find the line that needs fixing
                  let targetLineIndex = -1;
                  let descLineCount = 0;

                  for (let i = 0; i < lines.length; i++) {
                    const line = lines[i].trim().replace(/^\*\s?/, "");
                    if (line.startsWith("@")) break;

                    if (descLineCount === lastDescLine.index) {
                      targetLineIndex = i;
                      break;
                    }
                    descLineCount++;
                  }

                  if (targetLineIndex === -1) return null;

                  // Remove duplicate punctuation
                  const updatedLines = [...lines];
                  const targetLine = updatedLines[targetLineIndex];
                  const indentMatch = targetLine.match(/^(\s*\*\s*)/);
                  const indent = indentMatch ? indentMatch[1] : " * ";
                  const content = targetLine
                    .replace(/^\s*\*\s*/, "")
                    .trimEnd()
                    .replace(/[:;,、]。$/, "。");
                  updatedLines[targetLineIndex] = `${indent}${content}`;

                  const newCommentValue = updatedLines.join("\n");
                  return fixer.replaceText(comment, `/*${newCommentValue}*/`);
                },
              });
            } else if (
              !trimmed.endsWith("。") &&
              !trimmed.endsWith(":") &&
              !trimmed.endsWith("：") &&
              !trimmed.includes(": ") &&
              !trimmed.includes("： ")
            ) {
              // Check 1b: Missing period (skip lines with colons like "参照: URL" or ending with colons)
              context.report({
                loc: comment.loc,
                messageId: "missingPeriod",
                fix(fixer) {
                  // Find the position to insert "。"
                  const commentText = comment.value;
                  const lines = commentText.split("\n");

                  // Find the line that needs "。"
                  let targetLineIndex = -1;
                  let descLineCount = 0;

                  for (let i = 0; i < lines.length; i++) {
                    const line = lines[i].trim().replace(/^\*\s?/, "");
                    if (line.startsWith("@")) break;

                    if (descLineCount === lastDescLine.index) {
                      targetLineIndex = i;
                      break;
                    }
                    descLineCount++;
                  }

                  if (targetLineIndex === -1) return null;

                  // Add "。" at the end of the line
                  const updatedLines = [...lines];
                  const targetLine = updatedLines[targetLineIndex];
                  const indentMatch = targetLine.match(/^(\s*\*\s*)/);
                  const indent = indentMatch ? indentMatch[1] : " * ";
                  const content = targetLine.replace(/^\s*\*\s*/, "").trimEnd();
                  updatedLines[targetLineIndex] = `${indent}${content}。`;

                  const newCommentValue = updatedLines.join("\n");
                  return fixer.replaceText(comment, `/*${newCommentValue}*/`);
                },
              });
            }
          }

          // Check 2: Bullet lists must have blank line before them
          // Find the first bullet list item
          let firstBulletIndex = -1;
          for (let i = 0; i < descriptionLines.length; i++) {
            if (isBulletLine(descriptionLines[i])) {
              firstBulletIndex = i;
              break;
            }
          }

          if (firstBulletIndex > 0) {
            const previousLine = descriptionLines[firstBulletIndex - 1];

            // Check if there's a non-empty line before the first bullet
            if (previousLine.trim() !== "") {
              context.report({
                loc: comment.loc,
                messageId: "missingBlankLineBeforeBullet",
                fix(fixer) {
                  // Insert blank line before bullet list
                  const commentText = comment.value;
                  const lines = commentText.split("\n");

                  // Find the bullet line position
                  let bulletLineIndex = -1;
                  let descLineCount = 0;

                  for (let j = 0; j < lines.length; j++) {
                    const line = lines[j].trim().replace(/^\*\s?/, "");
                    if (line.startsWith("@")) break;

                    if (descLineCount === firstBulletIndex) {
                      bulletLineIndex = j;
                      break;
                    }
                    descLineCount++;
                  }

                  if (bulletLineIndex === -1) return null;

                  // Insert blank line
                  const updatedLines = [...lines];
                  const bulletLine = updatedLines[bulletLineIndex];
                  const indentMatch = bulletLine.match(/^(\s*\*)/);
                  const indent = indentMatch ? indentMatch[1] : " *";
                  updatedLines.splice(bulletLineIndex, 0, indent);

                  const newCommentValue = updatedLines.join("\n");
                  return fixer.replaceText(comment, `/*${newCommentValue}*/`);
                },
              });
            }
          }
        }
      },
    };
  },
};
