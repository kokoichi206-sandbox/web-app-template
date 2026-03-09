import pino, { type LoggerOptions } from "pino";

import { isLocal } from "@/shared/env/client-env";

export const isError = (v: unknown): v is Error =>
  Object.prototype.toString.call(v) === "[object Error]" || v instanceof Error;

// Standard log level to severity mapping
const levelToSeverity: Record<string, string> = {
  trace: "DEBUG",
  debug: "DEBUG",
  info: "INFO",
  warn: "WARNING",
  error: "ERROR",
  fatal: "CRITICAL",
};

// Enhanced error serialization for better error tracking
const errorSerializer = (err: unknown) => {
  if (isError(err)) {
    return Object.assign({}, err, {
      kind: err.name,
      message: err.message,
      stack: err.stack,
    });
  }
  return err;
};

const doNothing = () => {};

export const defaultPinoConfig = {
  base: {
    serviceContext: {
      service: "web-app-template",
    },
  },
  level: isLocal() ? "debug" : "info",
  messageKey: "message",
  formatters: {
    level: (label: string, _number: number) => {
      const severity = levelToSeverity[label] ?? "INFO";
      return { severity };
    },
    // Enhanced error handling in log objects
    log: (obj) => {
      const logObject = obj;

      if (logObject instanceof Error) {
        return { error: errorSerializer(logObject) };
      }

      // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
      if (logObject["error"]) {
        logObject["error"] = errorSerializer(logObject["error"]);
        // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
      } else if (logObject["err"]) {
        logObject["error"] = errorSerializer(logObject["err"]);
        delete logObject["err"];
      }

      return logObject;
    },
  },
} as const satisfies Omit<LoggerOptions, "browser">;

// Create browser config separately to avoid type issues
// Return type is non-nullable to work with exactOptionalPropertyTypes
const createBrowserConfig = (): NonNullable<LoggerOptions["browser"]> => {
  if (isLocal()) {
    return {
      asObject: true,
      serialize: ["!error"],
    };
  }

  return {
    asObject: true,
    write: {
      // Allow fatal, error, warn logs (use default console methods).
      info: doNothing,
      debug: doNothing,
      trace: doNothing,
    },
    serialize: ["!error"],
  };
};

/**
 * Cross-platform logger (server & browser)
 *
 * Server: Outputs structured logs with severity levels
 * Browser: In development shows all logs, in production only warn+
 */
// Create logger with appropriate options
const createLogger = () => {
  if (typeof window !== "undefined") {
    // Browser environment - browser config is always defined
    const browserOptions: LoggerOptions = {
      ...defaultPinoConfig,
      browser: createBrowserConfig(),
      mixin: () => ({}),
    };
    return pino(browserOptions);
  }

  // Server environment - don't include browser config
  const serverOptions: LoggerOptions = {
    ...defaultPinoConfig,
  };

  // Only add transport in local development
  if (isLocal()) {
    serverOptions.transport = {
      target: "pino-pretty",
      options: {
        colorize: true,
        ignore: "pid,hostname",
        translateTime: "HH:MM:ss Z",
      },
    };
  }

  return pino(serverOptions);
};

export const logger = createLogger();

// Export types for convenience
export type Logger = typeof logger;
export type LogLevel = "trace" | "debug" | "info" | "warn" | "error" | "fatal";
