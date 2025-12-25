// src/utils/redis_client.ts
import { redisClient } from "@config/redis";
import { throwSessionExpired } from "@errors/auth";
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

/** 
 * Retrieves the user's current signup progress from Redis.
 * 
 * If Redis returns nothing, it means the session is invalid, expired, or tampered.
 * This ensures only verified, time-bound signup flows can proceed.
 */
export const getPending = async (signupSessionID: string) => {
  logger.debug("Retrieving pending signup data from Redis...");
  const pendingStr = await getCache(`pending_signup:${signupSessionID}`);
  if (!pendingStr) throwSessionExpired();
  return JSON.parse(pendingStr!);
};