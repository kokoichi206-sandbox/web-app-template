/**
 * ESLint rule to prohibit Supabase Data API usage.
 *
 * Allowed:
 * - Supabase Auth API (e.g. supabase.auth.getUser())
 * - Supabase Storage API (e.g. supabase.storage.from(bucket))
 *
 * Prohibited:
 * - Supabase Data API method calls (supabase.from(...), supabase.rpc(...))
 * - Direct REST endpoint calls to /rest/v1 via fetch()
 *
 * Recommended alternative:
 * - Use Prisma for database operations.
 */

const DATA_API_METHODS = new Set(["from", "rpc"]);
const SUPABASE_CLIENT_FACTORIES = new Set([
  "createClient",
  "createServiceRoleClient",
  "createServerClient",
  "createBrowserClient",
  "createSupabaseClient",
]);

/**
 * @param {import("typescript").TypeChecker} checker
 * @param {import("typescript").Type | undefined} type
 * @returns {boolean}
 */
function isSupabaseDataApiType(checker, type) {
  if (!type) {
    return false;
  }

  const typeString = checker.typeToString(type);
  return typeString.includes("SupabaseClient") || typeString.includes("PostgrestClient");
}

/**
 * @param {import("estree").Node} node
 * @returns {import("estree").Node | null}
 */
function unwrapAwait(node) {
  let current = node;
  while (current && current.type === "AwaitExpression") {
    current = current.argument;
  }
  return current || null;
}

/**
 * Fallback heuristic used when type information is unavailable.
 *
 * @param {import("estree").Node} node
 * @returns {boolean}
 */
function isKnownSupabaseClientExpression(node) {
  const target = unwrapAwait(node);
  if (!target) {
    return false;
  }

  if (target.type === "Identifier") {
    return target.name.toLowerCase().includes("supabase");
  }

  if (target.type === "CallExpression") {
    const callee = target.callee;

    if (callee.type === "Identifier") {
      return SUPABASE_CLIENT_FACTORIES.has(callee.name);
    }

    if (
      callee.type === "MemberExpression" &&
      callee.property.type === "Identifier" &&
      SUPABASE_CLIENT_FACTORIES.has(callee.property.name)
    ) {
      return true;
    }
  }

  return false;
}

/**
 * @param {import("estree").CallExpression["callee"]} callee
 * @returns {boolean}
 */
function isFetchCall(callee) {
  if (callee.type === "Identifier" && callee.name === "fetch") {
    return true;
  }

  if (
    callee.type === "MemberExpression" &&
    callee.property.type === "Identifier" &&
    callee.property.name === "fetch"
  ) {
    return true;
  }

  return false;
}

/**
 * @param {import("estree").Node | undefined} node
 * @returns {string | null}
 */
function getStaticString(node) {
  if (!node) {
    return null;
  }

  if (node.type === "Literal" && typeof node.value === "string") {
    return node.value;
  }

  if (node.type === "TemplateLiteral" && node.expressions.length === 0) {
    return node.quasis[0]?.value?.cooked ?? null;
  }

  return null;
}

/**
 * @param {string | null} url
 * @returns {boolean}
 */
function isSupabaseRestDataApiPath(url) {
  if (!url) {
    return false;
  }

  return /\/rest\/v1(?:\/|\?|$)/.test(url);
}

/** @type {import("eslint").Rule.RuleModule} */
export default {
  meta: {
    type: "problem",
    docs: {
      description:
        "Prohibit Supabase Data API usage (.from/.rpc and /rest/v1) and enforce Prisma for DB access",
      recommended: true,
    },
    schema: [],
    messages: {
      noSupabaseDataApiMethod:
        "Supabase Data API (.from() / .rpc()) is not allowed. Use Prisma for database operations instead.",
      noSupabaseDataApiRest:
        "Direct Supabase Data API endpoint (/rest/v1) is not allowed. Use Prisma for database operations instead.",
    },
  },

  create(context) {
    const parserServices = context.sourceCode.parserServices;
    const hasTypeInfo =
      parserServices &&
      parserServices.program &&
      parserServices.esTreeNodeToTSNodeMap;

    return {
      CallExpression(node) {
        if (
          node.callee.type === "MemberExpression" &&
          node.callee.property.type === "Identifier" &&
          DATA_API_METHODS.has(node.callee.property.name)
        ) {
          const object = node.callee.object;

          if (hasTypeInfo) {
            try {
              const checker = parserServices.program.getTypeChecker();
              const tsNode = parserServices.esTreeNodeToTSNodeMap.get(object);

              // If type info is available and the type is not Supabase Data API,
              // we do not fallback to heuristic detection to avoid false positives.
              if (tsNode) {
                const type = checker.getTypeAtLocation(tsNode);
                if (isSupabaseDataApiType(checker, type)) {
                  context.report({
                    node,
                    messageId: "noSupabaseDataApiMethod",
                  });
                }
                return;
              }
            } catch {
              // Fallback to heuristic detection below.
            }
          }

          if (isKnownSupabaseClientExpression(object)) {
            context.report({
              node,
              messageId: "noSupabaseDataApiMethod",
            });
          }
          return;
        }

        if (!isFetchCall(node.callee)) {
          return;
        }

        const [firstArg] = node.arguments;
        let url = getStaticString(firstArg);

        if (
          !url &&
          firstArg &&
          firstArg.type === "NewExpression" &&
          firstArg.callee.type === "Identifier" &&
          firstArg.callee.name === "URL"
        ) {
          url = getStaticString(firstArg.arguments[0]);
        }

        if (isSupabaseRestDataApiPath(url)) {
          context.report({
            node,
            messageId: "noSupabaseDataApiRest",
          });
        }
      },
    };
  },
};
