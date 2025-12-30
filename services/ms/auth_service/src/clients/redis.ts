import { createClient } from "redis";
import { logger } from "@utils/logger";
import { env } from "@config/env";

const redisUrl = env.AUTH_REDIS_STORE_URI;

const MAX_RETRIES = 3;
let currentTries = 0

// Creating redis clent with backoff strategy
export const redisClient = createClient({
  url: redisUrl,
  socket: {
    reconnectStrategy: (retries) => {
      // exponential backoff up to 3 seconds
      if (currentTries >= MAX_RETRIES) throw new Error("❌ Failed to connect to Redis, Critical faliure");
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
    if (!redisClient.isOpen) await redisClient.connect();
  } catch (err) {
    logger.error("❌ Failed to connect to Redis: " + (err as Error).message);
    process.exit(1);
  }
};
