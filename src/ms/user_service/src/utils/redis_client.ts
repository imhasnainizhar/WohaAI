// src/utils/redis_client.ts
import { redisClient } from "@config/redis.config";
import { logger } from "@utils/logger";

export const setCache = async (key: string, value: string, ttlSeconds?: number) => {
  try {
    if (ttlSeconds) {
      await redisClient.set(key, value, { EX: ttlSeconds });
    } else {
      await redisClient.set(key, value);
    }
    logger.debug(`🧩 Redis SET: ${key}`);
  } catch (err) {
    logger.error("Redis setCache error: " + (err as Error).message);
    throw err;
  }
};

export const getCache = async (key: string): Promise<string | null> => {
  try {
    const result = await redisClient.get(key);
    logger.debug(`🧩 Redis GET: ${key} → ${result ? "HIT" : "MISS"}`);
    return result;
  } catch (err) {
    logger.error("Redis getCache error: " + (err as Error).message);
    throw err;
  }
};

export const deleteCache = async (key: string) => {
  try {
    await redisClient.del(key);
    logger.debug(`🧩 Redis DEL: ${key}`);
  } catch (err) {
    logger.error("Redis deleteCache error: " + (err as Error).message);
    throw err;
  }
};
