import { logger } from "../logger";

export const authMailerLogger = logger.child({
  service: "auth-mailer-service",
});