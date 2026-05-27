import express, { Express } from "express";
import { json, urlencoded } from "body-parser";
import authRoutes from "@/routes/auth.js";
import { logger } from "@packages/observability";
import { errorHandler } from "@/middlewares/error-handler";
import { redisClient } from "@packages/redis";
import cors from "cors";
import cookieParser from "cookie-parser";
import { envConfigs } from "@packages/config";

const app: Express = express();

// Parse cookies from incoming requests
app.use(cookieParser());

// Parse JSON payloads from incoming requests
app.use(json());

// Parse URL-encoded payloads (e.g., form submissions)
app.use(urlencoded({ extended: true }));

// Global error handler
app.use(errorHandler);

// Connect to Redis in background (non-blocking)
// Don't block server startup if Redis is unavailable
(async () => {
  try {
    await Promise.race([
      redisClient.redis.connect(),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error("Redis connection timeout")), 10000)
      )
    ]);
  } catch (err) {
    // Log error but don't crash - Redis might not be available yet
    logger.error("⚠️ Redis connection failed or timed out, continuing without Redis:" + (err as Error).message);
  }
})();

const corsOptions = {
  origin: envConfigs.CLIENT_ORIGIN, // frontend origin
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true, // if using cookies or auth headers
};

// Mount auth-related routes
app.use("/", cors(corsOptions), authRoutes);
app.use("/hi", cors(corsOptions), (req, res) => {
  res.json({status: 200, text: "hello"})
})

export default app;