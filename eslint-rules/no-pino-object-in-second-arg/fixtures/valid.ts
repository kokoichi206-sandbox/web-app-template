// Valid cases - should NOT trigger the rule

import { logger } from "@/lib/logger";

// Correct order: object first, message second
logger.info({ userId: "123" }, "User logged in");
logger.debug({ data: { foo: "bar" } }, "Debug data");

// Message only is allowed
logger.info("Simple message");
logger.warn("Warning message");

// Object only is allowed
logger.error({ err: new Error("Some error") });

// err キーは OK (canonical key)
logger.error({ err: new Error("Error message") }, "Operation failed");
logger.warn({ err: new Error("Warning error"), jobId: "123" }, "Something happened");
