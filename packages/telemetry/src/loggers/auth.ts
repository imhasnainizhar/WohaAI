import { logger } from "../logger";

export const authLogger = logger.child({
  service: "auth-service",
});