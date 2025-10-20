// src/utils/logger.ts
import { env } from "@config/env.config";
import pino from "pino";

// Detect environment
const isDev = env.NODE_ENV !== "production";

// Configure base logger
export const logger = pino({
  level: env.LOG_LEVEL || (isDev ? "debug" : "info"),
  transport: isDev
    ? {
        target: "pino-pretty",
        options: {
          colorize: true,
          translateTime: "SYS:standard",
          ignore: "pid,hostname",
        },
      }
    : undefined,
  base: undefined, // Remove pid & hostname to keep logs clean for structured output
});
