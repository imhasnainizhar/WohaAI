import { logger } from "../logger";

export const userLogger = logger.child({
  service: "user-service",
});