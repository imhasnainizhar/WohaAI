import pino from "pino";

// Detect environment
const isDev = process.env.NODE_ENV !== "production";

// Configure base logger
export const logger = pino({
  level: process.env.LOG_LEVEL || (isDev ? "debug" : "info"),
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