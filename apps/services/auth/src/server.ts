// require('module-alias/register'); // Legacy as we are moved towards NPM Workspace's @package/shared/ shared-library

import { authLogger } from "@wohaai/telemetry";
import app from "./app.js";
import { env } from "@wohaai/env-ts";
import { connectUsersDB } from "./db";

// Connect to MongoDB
(async () => {
  await connectUsersDB(env.USERS_MONGO_URI);
  authLogger.info("✅ Auth Service connected to MongoDB" + env.USERS_MONGO_URI);
})();

const PORT = env.AUTH_SERVICE_PORT;

app.listen(PORT, () => {
  authLogger.info(`✅ Auth Service running on port ${PORT}`);
  authLogger.debug("DB URI:" + env.USERS_MONGO_URI);
});