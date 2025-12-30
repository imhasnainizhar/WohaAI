// src/utils/redis_client.ts
import { env, EXPIRATION } from "@config/env";
import { throwSessionExpired } from "@errors/auth";
import { logger } from "@utils/logger";
import { redisClient } from "@clients/redis";

/** 
 * Retrieves the user's current signup progress from Redis.
 * 
 * If Redis returns nothing, it means the session is invalid, expired, or tampered.
 * This ensures only verified, time-bound signup flows can proceed.
 */

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

export const getSignupCache = async (signupSessionID: string) => {
  logger.debug("Retrieving pending signup data from Redis...");
  const pendingStr = await getCache(`${env.ACTIVE_SIGNUP_SESSION_KEY}:${signupSessionID}`);
  if (!pendingStr) throwSessionExpired();
  return JSON.parse(pendingStr!);
};

export const setSignupCache = async (signupSessionID: string, data: any) => {
  logger.debug("Setting pending signup data in Redis...");
  await setCache(`${env.ACTIVE_SIGNUP_SESSION_KEY}:${signupSessionID}`, 
    JSON.stringify(data), EXPIRATION.REDIS_SIGNUP_SESSION_TTL);
};

export const deleteSignupCache = async (signupSessionID: string) => {
  logger.debug("Deleting pending signup data from Redis...");
  await deleteCache(`${env.ACTIVE_SIGNUP_SESSION_KEY}:${signupSessionID}`);
};

export const getSigninCache = async (signinSessionID: string) => {
  logger.debug("Retrieving pending signin data from Redis...");
  const pendingStr = await getCache(`${env.ACTIVE_SIGNIN_SESSION_KEY}:${signinSessionID}`);
  if (!pendingStr) throwSessionExpired();
  return JSON.parse(pendingStr!);
};

export const setSigninCache = async (signinSessionID: string, data: any) => {
  logger.debug("Setting pending signin data in Redis...");
  await setCache(`${env.ACTIVE_SIGNIN_SESSION_KEY}:${signinSessionID}`, 
    JSON.stringify(data), EXPIRATION.REDIS_SIGNIN_SESSION_TTL);
};

export const deleteSigninCache = async (signinSessionID: string) => {
  logger.debug("Deleting pending signin data from Redis...");
  await deleteCache(`${env.ACTIVE_SIGNIN_SESSION_KEY}:${signinSessionID}`);
};
