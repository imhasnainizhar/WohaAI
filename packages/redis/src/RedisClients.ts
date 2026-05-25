import { logger } from "@packages/observability";
import { InternalServerError } from "@packages/errors";
import Redis from "ioredis";
import { envConfigs, EnvConfig } from "@packages/config";

class RedisClient {
    private static instance: RedisClient;
    public redis: Redis;
    private env: EnvConfig;

    private constructor(env: EnvConfig) {
        this.env = env;

        // =========================
        // Redis client
        // =========================

        this.redis = new Redis(this.env.AUTH_SESSION_STORE_URI, {
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

    // =========================
    // Singleton accessor
    // =========================

    public static getInstance(env: EnvConfig): RedisClient {
        if (!RedisClient.instance) {
            RedisClient.instance = new RedisClient(env);
        }

        return RedisClient.instance;
    }
}

export const redisClient = RedisClient.getInstance(envConfigs)