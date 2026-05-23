import { PrismaClient } from "../../prisma/generated/prisma/client.js";
import { PrismaPg } from "@prisma/adapter-pg";
import { createClient, type RedisClientType } from "redis";
import { logger } from "@helpers/logger.js";
import { throwInternalError } from "@packages/shared/errors";
import { EnvConfig } from "@config/env.js";

export default class RepoClients {
  private static instance: RepoClients;

  public prisma: PrismaClient;
  public redis: RedisClientType;
  private env: EnvConfig;

  private redisRetries = 0;
  private readonly MAX_RETRIES = 3;

  private constructor(env: EnvConfig) {
    this.env = env;
    // =========================
    // Prisma
    // =========================

    const adapter = new PrismaPg({
      connectionString: env.USERS_PRISMA_DB_URI!,
    });

    this.prisma = new PrismaClient({
      adapter,
      log:
        env.NODE_ENV === "development"
          ? ["query", "error", "warn"]
          : ["error"],
    });

    // =========================
    // Redis
    // =========================

    this.redis = createClient({
      url: env.AUTH_REDIS_STORE_URI,

      socket: {
        connectTimeout: 5000,

        reconnectStrategy: (retries) => {
          if (this.redisRetries >= this.MAX_RETRIES) {
            logger.fatal("❌ Failed to connect to Redis after max retries");

            throwInternalError(
              "Failed to connect to Redis after max retries",
            );
          }

          this.redisRetries++;
          return Math.min(retries * 100, 3000);
        },
      },
    });

    this.registerRedisListeners();
  }

  // =========================
  // Singleton accessor
  // =========================

  public static getInstance(env: EnvConfig): RepoClients {
    if (!RepoClients.instance) {
        RepoClients.instance = new RepoClients(env);
    }

    return RepoClients.instance;
  }

  // =========================
  // Redis listeners
  // =========================

  private registerRedisListeners() {
    this.redis.on("connect", () =>
      logger.info("🧠 Redis connected successfully"),
    );

    this.redis.on("ready", () =>
      logger.info("✅ Redis client ready to use"),
    );

    this.redis.on("end", () =>
      logger.warn("⚠️ Redis connection closed"),
    );

    this.redis.on("reconnecting", () =>
      logger.info("♻️ Redis reconnecting..."),
    );

    this.redis.on("error", (err) =>
      logger.error("❌ Redis error: " + err.message),
    );
  }

  // =========================
  // Connect resources
  // =========================

  public async connectAll() {
    await this.connectRedis();

    await this.prisma.$connect();

    logger.info("🚀 Infrastructure RepoClients connected");
  }

  // =========================
  // Disconnect resources
  // =========================

  public async disconnectAll() {
    await this.redis.quit();

    await this.prisma.$disconnect();

    logger.info("🛑 Infrastructure RepoClients disconnected");
  }

  // =========================
  // Redis connection
  // =========================

  private async connectRedis() {
    try {
      if (!this.redis.isOpen) {
        await Promise.race([
          this.redis.connect(),

          new Promise((_, reject) =>
            setTimeout(
              () =>
                reject(
                  new Error(
                    "Redis connection timeout after 10 seconds",
                  ),
                ),
              10000,
            ),
          ),
        ]);
      }
    } catch (err) {
      logger.error(
        "❌ Failed to connect to Redis: " +
          (err as Error).message,
      );

      throw err;
    }
  }
}