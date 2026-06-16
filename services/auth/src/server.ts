// require('module-alias/register'); // Legacy as we are moved towards NPM Workspace's @package/shared/ shared-library

import { authLogger } from "@packages/observability";
import app from "./app.js";
import cors from "cors"
import { env } from "@packages/env-ts";
import { connectUsersDB } from "@packages/db";

// Connect to MongoDB
(async () => {
  await connectUsersDB(env.USERS_MONGO_URI);
  authLogger.info("✅ Auth Service connected to MongoDB" + env.USERS_MONGO_URI);
})();

// CORS configuration
const corsOptions = {
  origin: env.CLIENT_ORIGIN || "http://localhost:3000", // frontend origin
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true, // if using cookies or auth headers
};

// Apply CORS middleware
app.use(cors(corsOptions));

const PORT = env.AUTH_SERVICE_PORT || 8091;

app.listen(PORT, () => {
  authLogger.info(`✅ Auth Service running on port ${PORT}`);
});