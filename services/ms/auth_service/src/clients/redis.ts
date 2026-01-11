import { createClient } from "redis";
import { logger } from "../internals/utils/logger";
import { env } from "@config/env";
import { throwInternalError } from "@packages/shared/errors";

const redisUrl = env.AUTH_REDIS_STORE_URI;

const MAX_RETRIES = 3;
let currentTries = 0

// Creating redis client with backoff strategy
export const redisClient = createClient({
  url: redisUrl,
  socket: {
    connectTimeout: 5000, // 5 second connection timeout
    reconnectStrategy: (retries) => {
      // exponential backoff up to 3 seconds
      if (currentTries >= MAX_RETRIES) {
        logger.fatal("❌ Failed to connect to Redis after max retries");
        throwInternalError("Failed to connect to Redis after max retries");

      }
      currentTries++
      return Math.min(retries * 100, 3000);
    },
  },
});

// Listeners
redisClient.on("connect", () => logger.info("🧠 Redis connected successfully"));
redisClient.on("ready", () => logger.info("✅ Redis client ready to use"));
redisClient.on("end", () => logger.warn("⚠️ Redis connection closed"));
redisClient.on("reconnecting", () => logger.info("♻️  Redis reconnecting..."));
redisClient.on("error", (err) => logger.error("❌ Redis error: " + err.message));

// Connecting logic
export const connectRedis = async () => {
  try {
    if (!redisClient.isOpen) {
      // Add timeout to prevent hanging
      await Promise.race([
        redisClient.connect(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error("Redis connection timeout after 10 seconds")), 10000)
        )
      ]);
    }
  } catch (err) {
    logger.error("❌ Failed to connect to Redis: " + (err as Error).message);
    // Don't exit process - allow server to start without Redis
    // Some features may not work, but server should still be usable
    throw err;
  }
};
