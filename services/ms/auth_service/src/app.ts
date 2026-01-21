import express from "express";
// import { json, urlencoded } from "body-parser";
import authRoutes from "@routes/auth.js";
import { logger } from "@internals/utils/logger";
import { errorHandler } from "@middlewares/error_handler";
import { connectRedis } from "@clients/redis";
import cors from "cors";

const app = express();

// Parse cookies from incoming requests
// app.use(cookieParser());

// Parse JSON payloads from incoming requests
// app.use(json());

// Parse URL-encoded payloads (e.g., form submissions)
// app.use(urlencoded({ extended: true }));

// Global error handler
app.use(errorHandler);

// Connect to Redis in background (non-blocking)
// Don't block server startup if Redis is unavailable
(async () => {
  try {
    await Promise.race([
      connectRedis(),
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
  origin: "http://localhost:3000", // frontend origin
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