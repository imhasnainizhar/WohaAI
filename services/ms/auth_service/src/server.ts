require('module-alias/register'); // Legacy as we are moved towards NPM Workspace's @package/shared/ shared-library

import { logger } from "@packages/shared/utils";
import app from "./app";
import { env } from "./config/env";

const PORT = env.AUTH_SERVICE_PORT;

const server = app.listen(PORT, () => {
  logger.info(`✅ Auth Service running on port ${PORT}`);
});