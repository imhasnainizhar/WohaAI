import { envConfigs, type EnvConfig } from "@packages/config";

import { logger } from "@packages/observability";

import {
  InternalServerError,
  SessionExpiredError,
} from "@packages/errors";

import { redisClient } from "./RedisClients";

export class RedisHelper {
  private static instance: RedisHelper;

  private constructor() {}

  // ========================================
  // Singleton
  // ========================================

  public static getInstance(): RedisHelper {
    if (!RedisHelper.instance) {
      RedisHelper.instance =
        new RedisHelper();
    }

    return RedisHelper.instance;
  }

  // ========================================
  // Generic cache setter
  // ========================================

  public async setCache(
    key: string,
    value: string,
    ttlSeconds?: number,
  ): Promise<"OK"> {
    try {
      if (ttlSeconds) {
        return await redisClient.redis.set(
          key,
          value,
          "EX",
          ttlSeconds,
        );
      } else {
        return await redisClient.redis.set(
          key,
          value,
        );
      }

      logger.debug(
        `🧩 Redis SET: ${key}`,
      );
    } catch (err) {
      logger.error({
        message:
          "Redis setCache failed",
        key,
        error:
          (err as Error).message,
      });

      throw new InternalServerError(
        err,
      );
    }
  }

  // ========================================
  // Generic cache getter
  // ========================================

  public async getCache(
    key: string,
  ): Promise<string | null> {
    try {
      // Returning value as it is in string format, service helpers will do JSON.parse() if needed.
      const result = 
        await redisClient.redis.get(
          key,
        );

      logger.debug(
        `🧩 Redis GET: ${key} → ${result
          ? "HIT"
          : "MISS"
        }`,
      );

      return result;
    } catch (err) {
      logger.error({
        message:
          "Redis getCache failed",
        key,
        error:
          (err as Error).message,
      });

      throw new InternalServerError(
        err,
      );
    }
  }

  // ========================================
  // Generic cache delete
  // ========================================

  public async deleteCache(
    key: string,
  ): Promise<void> {
    try {
      await redisClient.redis.del(
        key,
      );

      logger.debug(
        `🧩 Redis DEL: ${key}`,
      );
    } catch (err) {
      logger.error({
        message:
          "Redis deleteCache failed",
        key,
        error:
          (err as Error).message,
      });

      throw new InternalServerError(
        err,
      );
    }
  }
}

export const redisHelpers =
  RedisHelper.getInstance();