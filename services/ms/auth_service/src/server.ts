require('module-alias/register'); // Legacy as we are moved towards NPM Workspace's @package/shared/ shared-library

import { logger } from "@packages/shared/utils";
import app from "./app";
import { env } from "./config/env";

const PORT = env.AUTH_SERVICE_PORT;

const server = app.listen(PORT, () => {
  logger.info(`✅ Auth Service running on port ${PORT}`);
});

server.on("error", (err: NodeJS.ErrnoException) => {
  logger.error(`❌ Failed to start server on port ${PORT}:` + err.message);
  if (err.code === "EADDRINUSE") {
    logger.error(`Port ${PORT} is already in use.`);
  }
  process.exit(1);
});