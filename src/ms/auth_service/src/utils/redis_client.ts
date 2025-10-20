// src/utils/redis_client.ts
import { redisClient } from "@config/redis.config";
import { logger } from "@utils/logger";

export const setCache = async (key: string, value: string, ttlSeconds?: number): Promise<Boolean> => {
  try {
    if (ttlSeconds) {
      await redisClient.set(key, value, { EX: ttlSeconds });
      return true;
    } else {
      await redisClient.set(key, value);
    }
    logger.debug(`🧩 Redis SET: ${key}`);
    return true;
  } catch (err) {
    logger.error("Redis setCache error: " + (err as Error).message);
    return false;
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

export const deleteCache = async (key: string): Promise<Boolean> => {
  try {
    await redisClient.del(key);
    logger.debug(`🧩 Redis DEL: ${key}`);
    return true;
  } catch (err) {
    logger.error("Redis deleteCache error: " + (err as Error).message);
    return false;  
  } 
};
