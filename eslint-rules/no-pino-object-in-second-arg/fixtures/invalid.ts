// Invalid cases - SHOULD trigger the rule

import { logger } from "@/lib/logger";

// Wrong order: message first, object second (should be reversed)
// 4 errors: wrongOrder
logger.info("User logged in", { userId: "123" });
logger.error("Operation failed", { err: new Error("Error message") });
logger.debug("Debug data", { data: { foo: "bar" } });
logger.warn("Warning", { level: "high" });

// error キーはエイリアスなので err に統一が必要
// 3 errors: canonicalErrorKey
logger.error({ error: new Error("Error message") }, "Operation failed");
logger.warn({ requestError: new Error("Request failed"), jobId: "123" }, "Request error");
logger.info({ parseError: new Error("Parse failed") }, "Parse error");
