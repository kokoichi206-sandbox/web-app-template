const levelNames = ["trace", "debug", "info", "warn", "error", "fatal"];
const ERROR_ALIAS_KEYS = ["error", "parseError", "supabaseError", "supabaseErr", "requestError"];
// default のシリアライザーでは err フィールドだけ、エラーオブジェクトとして特別な処理がかかる。
// https://github.com/pinojs/pino-std-serializers#exportserrerror
const CANONICAL_ERROR_KEY = "err";

function isStringLike(node) {
  if (!node) return false;
  if (node.type === "TemplateLiteral") return true;
  if (node.type === "Literal") return typeof node.value === "string";
  return false;
}

function getBaseObjectName(node) {
  if (!node) return null;
  if (node.type === "Identifier") return node.name;
  if (node.type === "MemberExpression") return getBaseObjectName(node.object);
  return null;
}

function isIdentifierProperty(prop) {
  return (
    prop &&
    prop.type === "Property" &&
    !prop.computed &&
    prop.key.type === "Identifier" &&
    !prop.method
  );
}

const rule = {
  meta: {
    type: "problem",
    docs: {
      description: "Enforce pino metadata/error object as the first argument",
    },
    fixable: "code",
    schema: [],
    messages: {
      wrongOrder: "メタデータやエラーは第1引数に渡してください（messageは第2引数）",
      canonicalErrorKey:
        "Pino にエラーを渡すときは第1引数のキーを err に統一してください（{{name}} は展開されません）",
    },
  },
  create(context) {
    const source = context.getSourceCode();

    return {
      CallExpression(node) {
        const callee = node.callee;

        const isPinoLevel =
          callee &&
          callee.type === "MemberExpression" &&
          callee.property.type === "Identifier" &&
          levelNames.includes(callee.property.name);

        const baseName =
          callee && callee.type === "MemberExpression" ? getBaseObjectName(callee.object) : null;
        const isLoggerObject = baseName === "logger";
        const isConsoleObject = baseName === "console";

        if (!isPinoLevel || !isLoggerObject || isConsoleObject) {
          return;
        }

        const args = node.arguments;
        if (args.length === 0) return;

        const firstArg = args[0];

        if (firstArg && firstArg.type === "ObjectExpression") {
          const props = firstArg.properties.filter((prop) => isIdentifierProperty(prop));
          const hasCanonicalError = props.some((prop) => prop.key.name === CANONICAL_ERROR_KEY);
          const aliasProps = props.filter((prop) => ERROR_ALIAS_KEYS.includes(prop.key.name));
          const canAutoFix = !hasCanonicalError && aliasProps.length === 1;

          aliasProps.forEach((prop) => {
            const keyName = prop.key.name;
            context.report({
              node: prop.key,
              messageId: "canonicalErrorKey",
              data: {
                name: keyName,
              },
              fix: canAutoFix
                ? (fixer) => {
                    if (prop.shorthand) {
                      return fixer.replaceText(prop, `${CANONICAL_ERROR_KEY}: ${prop.key.name}`);
                    }
                    return fixer.replaceText(prop.key, CANONICAL_ERROR_KEY);
                  }
                : null,
            });
          });
        }

        if (args.length >= 2 && isStringLike(firstArg)) {
          const second = args[1];

          if (second && second.type === "ObjectExpression") {
            context.report({
              node,
              messageId: "wrongOrder",
              fix: (fixer) => {
                const [, obj, ...rest] = args;
                const calleeText = source.getText(callee);
                const messageText = source.getText(firstArg);
                const restText = rest.map((arg) => ", " + source.getText(arg)).join("");
                return fixer.replaceText(
                  node,
                  `${calleeText}(${source.getText(obj)}, ${messageText}${restText})`
                );
              },
            });
            return;
          }

          if (!isStringLike(second)) {
            context.report({
              node,
              messageId: "wrongOrder",
              fix: (fixer) => {
                const [, meta, ...rest] = args;

                let metaText;
                if (meta.type === "Identifier") {
                  const name = meta.name;
                  if (name === CANONICAL_ERROR_KEY) {
                    metaText = `{ ${CANONICAL_ERROR_KEY} }`;
                  } else if (ERROR_ALIAS_KEYS.includes(name) || name === "e") {
                    metaText = `{ ${CANONICAL_ERROR_KEY}: ${name} }`;
                  } else {
                    metaText = `{ ${name}: ${name} }`;
                  }
                } else {
                  metaText = `{ meta: ${source.getText(meta)} }`;
                }

                const restText = rest.map((arg) => ", " + source.getText(arg)).join("");
                return fixer.replaceText(
                  node,
                  `${source.getText(callee)}(${metaText}, ${source.getText(firstArg)}${restText})`
                );
              },
            });
          }
        }
      },
    };
  },
};

module.exports = rule;
