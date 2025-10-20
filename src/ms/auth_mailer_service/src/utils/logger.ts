import pino from "pino";
import { env } from "process";

const isDev = env.NODE_ENV !== "production";

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
  base: undefined, // remove pid & hostname for clean JSON output
});

// Example usage:
// logger.debug("This log is dev-only");
// logger.info("This log appears in both dev and prod");
// logger.error("Something went wrong!");
