import { logger } from "../logger";

export const mcpServerLogger = logger.child({
  service: "mcp-server",
});