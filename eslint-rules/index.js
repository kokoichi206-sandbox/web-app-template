/**
 * Custom ESLint rules for web-app-template
 */
import enforceErrorHandlingPattern from "./enforce-error-handling-pattern/index.js";
import enforceNamingConvention from "./enforce-naming-convention/rule.js";
import jsdocFormatJapanese from "./jsdoc-format-japanese/rule.js";
import maxApiRouteHandlerLines from "./max-api-route-handler-lines/rule.js";
import maxParamsWithObject from "./max-params-with-object/rule.js";
import noBrowserNotifications from "./no-browser-notifications/rule.js";
import noDirectLayerImport from "./no-direct-layer-import/rule.js";
import noDirectServerImport from "./no-direct-server-import/rule.js";
import noDynamicEnvAccess from "./no-dynamic-env-access/index.js";
import noMagicStringsInSql from "./no-magic-strings-in-sql/index.js";
import noPinoObjectInSecondArg from "./no-pino-object-in-second-arg/rule.js";
import noRelativeImportsAcrossLayers from "./no-relative-imports-across-layers/index.js";
import noSupabaseDataApi from "./no-supabase-data-api/rule.js";
import noThrowStatement from "./no-throw-statement/rule.js";
import noTopLevelAwaitInActions from "./no-top-level-await-in-actions/index.js";
import requireUiStorybookStory from "./require-ui-storybook-story/rule.js";
import requireResultReturnType from "./require-result-return-type/rule.js";
import requireServerOnly from "./require-server-only/rule.js";
import requireWithAuth from "./require-with-auth/rule.js";

export default {
  rules: {
    "require-server-only": requireServerOnly,
    "enforce-naming-convention": enforceNamingConvention,
    "no-pino-object-in-second-arg": noPinoObjectInSecondArg,
    "require-result-return-type": requireResultReturnType,
    "no-supabase-data-api": noSupabaseDataApi,
    "no-browser-notifications": noBrowserNotifications,
    "no-direct-layer-import": noDirectLayerImport,
    "no-direct-server-import": noDirectServerImport,
    "no-throw-statement": noThrowStatement,
    "require-with-auth": requireWithAuth,
    "require-ui-storybook-story": requireUiStorybookStory,
    "jsdoc-format-japanese": jsdocFormatJapanese,
    "max-api-route-handler-lines": maxApiRouteHandlerLines,
    "max-params-with-object": maxParamsWithObject,
    "no-relative-imports-across-layers": noRelativeImportsAcrossLayers,
    "enforce-error-handling-pattern": enforceErrorHandlingPattern,
    "no-dynamic-env-access": noDynamicEnvAccess,
    "no-magic-strings-in-sql": noMagicStringsInSql,
    "no-top-level-await-in-actions": noTopLevelAwaitInActions,
  },
};
