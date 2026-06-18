import { logger } from "../logger";

export const agentLogger = logger.child({
  service: "agent",
});