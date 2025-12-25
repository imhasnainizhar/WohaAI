import { createClient } from "redis";
import { logger } from "@utils/logger";
import { env } from "@config/env";

const redisUrl = env.AUTH_REDIS_STORE_URI;

export const redisClient = createClient({
  url: redisUrl,
  socket: {
    reconnectStrategy: (retries) => {
      // exponential backoff up to 3 seconds
      return Math.min(retries * 100, 3000);
    },
  },
});

redisClient.on("connect", () => logger.info("🧠 Redis connected successfully"));
redisClient.on("ready", () => logger.info("✅ Redis client ready to use"));
redisClient.on("end", () => logger.warn("⚠️ Redis connection closed"));
redisClient.on("reconnecting", () => logger.info("♻️  Redis reconnecting..."));
redisClient.on("error", (err) => logger.error("❌ Redis error: " + err.message));

export const connectRedis = async () => {
  try {
    if (!redisClient.isOpen) await redisClient.connect();
  } catch (err) {
    logger.error("❌ Failed to connect to Redis: " + (err as Error).message);
    process.exit(1);
  }
};
