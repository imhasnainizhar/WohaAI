
import { logger } from "../logger";

export const nextAppLogger = logger.child({
  service: "nextjs-app",
});