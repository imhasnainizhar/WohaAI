require('module-alias/register'); // Legacy as we are moved towards NPM Workspace's @package/shared/ shared-library

import { logger } from "@packages/shared/utils";
import app from "./app";
import { env } from "./config/env";
import cors from "cors"

// CORS configuration
const corsOptions = {
  origin: "http://localhost:3000", // frontend origin
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true, // if using cookies or auth headers
};

// Apply CORS middleware
// app.use(cors(corsOptions));

const PORT = env.AUTH_SERVICE_PORT;

const server = app.listen(PORT, () => {
  logger.info(`✅ Auth Service running on port ${PORT}`);
});