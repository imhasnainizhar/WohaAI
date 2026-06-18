import { authLogger as logger } from "@wohaai/telemetry";
import { InternalServerError, ServiceError, SessionExpiredError } from "@wohaai/errors";
import Redis from "ioredis";

export class RedisClient {
    private static instance: RedisClient;
    public redis: Redis;
    private redisConnectionURI: string;

    constructor(redisConnectionURI: string) {
        this.redisConnectionURI = redisConnectionURI;

        // =========================
        // Redis client
        // =========================

        this.redis = new Redis(this.redisConnectionURI, {
            maxRetriesPerRequest: 3,

            retryStrategy: (times) => {
                const delay = Math.min(times * 500, 5000);

                logger.warn(
                    `♻️ Redis reconnect attempt #${times} in ${delay}ms`,
                );

                return delay;
            },
        });

        this.registerRedisListeners();
    }

    // =========================
    // Redis listeners
    // =========================

    private registerRedisListeners(): void {
        this.redis.on("connect", () => {
            logger.info("🧠 Redis connected successfully");
        });

        this.redis.on("ready", () => {
            logger.info("✅ Redis client ready");
        });

        this.redis.on("close", () => {
            logger.warn("⚠️ Redis connection closed");
        });

        this.redis.on("reconnecting", () => {
            logger.info("♻️ Redis reconnecting...");
        });

        this.redis.on("error", (err: Error) => {
            logger.error(`❌ Redis error: ${err.message}`);
            throw new InternalServerError(err)
        });
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
                return await this.redis.set(
                    key,
                    value,
                    "EX",
                    ttlSeconds,
                );
            } else {
                return await this.redis.set(
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
            const result = await this.redis.get(key);

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
        const result = await this.redis.del(key);

        if (!result) throw new InternalServerError()
        if (result === 0) throw new SessionExpiredError()

        logger.debug(
            `🧩 Redis DEL: ${key} → ${result === 1 ? "DELETED" : "NOT_FOUND"}`
        );
    }
}