import { createClient } from 'redis';
import { env } from '@config/env.config.js';
import { logger } from '@utils/logger.js';

export const memoryRedisClient = createClient({
    url: env.MEMORY_REDIS_STORE_URI,
    password: env.MEMORY_REDIS_STORE_PASSWORD,
    username: env.MEMORY_REDIS_STORE_USERNAME,
    socket: {
        reconnectStrategy: (retries) => {
            // exponential backoff up to 3 seconds
            return Math.min(retries * 100, 3000);
        },
    },
});

memoryRedisClient.on('error', (err) => logger.error('Memory Redis Client Error', err));

export const connectMemoryRedis = async () => {
    try {
        if (!memoryRedisClient.isOpen) await memoryRedisClient.connect();
        logger.info("✅ Memory Redis connected successfully");
    } catch (err) {
        logger.error("❌ Failed to connect to Memory Redis: " + (err as Error).message);
        process.exit(1);
    }
};