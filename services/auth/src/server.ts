// require('module-alias/register'); // Legacy as we are moved towards NPM Workspace's @package/shared/ shared-library

import { authLogger } from "@packages/observability";
import app from "./app.js";
import { env } from "@/config/env.js";
import cors from "cors"

// CORS configuration
const corsOptions = {
  origin: env.CLIENT_ORIGIN, // frontend origin
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true, // if using cookies or auth headers
};

// Apply CORS middleware
app.use(cors(corsOptions));

const PORT = env.AUTH_SERVICE_PORT;

app.listen(PORT, () => {
  authLogger.info(`✅ Auth Service running on port ${PORT}`);
});

console.log("DB URI:", process.env.USERS_PRISMA_DB_URI);