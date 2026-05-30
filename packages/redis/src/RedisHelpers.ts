import { authLogger as logger } from "@packages/observability";

import {
  InternalServerError,
  ServiceError,
  SessionExpiredError,
} from "@packages/errors";

import { redisClient } from "./RedisClients";

export class RedisHelper {
  private static instance: RedisHelper;

  private constructor() { }

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
  ): Promise<string> {
    try {
      const result = await redisClient.redis.get(key);

      logger.debug(
        `🧩 Redis GET: ${key} → ${result ? "HIT" : "MISS"}`
      );

      if (result === null) {
        throw new SessionExpiredError();
      }

      return result;
    } catch (err) {
      // IMPORTANT: do not wrap domain errors again
      if (err instanceof SessionExpiredError) {
        throw err;
      }

      if (err instanceof ServiceError) {
        logger.error({
          message: "Redis getCache failed",
          key,
          error: err.message,
        });

        throw err;
      }

      logger.error({
        message: "Redis unexpected failure",
        key,
        error: (err as Error).message,
      });

      throw new InternalServerError(err);
    }
  }

  // ========================================
  // Generic cache delete
  // ========================================

  public async deleteCache(
    key: string,
  ): Promise<void> {
      const result = await redisClient.redis.del(key);

      if(!result) throw new InternalServerError()
      if ( result === 0 ) throw new SessionExpiredError()

      logger.debug(
        `🧩 Redis DEL: ${key} → ${result === 1 ? "DELETED" : "NOT_FOUND"}`
      );
  }
}

export const redisHelpers =
  RedisHelper.getInstance();