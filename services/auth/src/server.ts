// require('module-alias/register'); // Legacy as we are moved towards NPM Workspace's @package/shared/ shared-library

import { authLogger } from "@packages/observability";
import app from "./app.js";
import { env } from "@/config/env.js";
import cors from "cors"
import { connectUsersDB } from "@packages/db";



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

async function bootstrap() {
  await connectUsersDB();

  app.listen(PORT, () => {
    authLogger.info(`Server running on port ${PORT}`);
  });
}

bootstrap();

authLogger.debug("DB URI:" + env.USERS_MONGO_URI);