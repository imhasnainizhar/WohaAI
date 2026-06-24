import { logger } from "../logger";

export const gatewayLogger = logger.child({
  service: "api-gateway",
});
