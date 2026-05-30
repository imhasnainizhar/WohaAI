import { createClient, RedisClientType } from 'redis';
import { env } from '@/config/env.js';
import { agentLogger as logger } from '@packages/observability';

export const memoryRedisClient: RedisClientType = createClient({
    url: env.,
    password: en,
    socket: {
        connectTimeout: 5000,
        reconnectStrategy: (retries) => {
            const delay = Math.min(retries * 100, 3000);
            logger.debug(`Memory Redis reconnect attempt #${retries}, next retry in ${delay}ms`);
            return delay;
        },
    },
});

// --- Event listeners for debugging ---
memoryRedisClient.on('error', (err) => logger.error('Memory Redis Client Error: ' + JSON.stringify(err)));
memoryRedisClient.on('connect', () => logger.debug('Memory Redis socket connected'));
memoryRedisClient.on('ready', () => logger.info('✅ Memory Redis ready'));
memoryRedisClient.on('end', () => logger.warn('Memory Redis connection closed'));
memoryRedisClient.on('reconnecting', () => logger.warn(`Memory Redis reconnecting`));

// --- Connection helper ---
export const connectMemoryRedis = async () => {
    if (memoryRedisClient.isOpen) {
        return;
    }
    logger.debug(`Connecting to Memory Redis with URL: ${env.MEMORY_REDIS_STORE_URI}`);
    try {
        await memoryRedisClient.connect();
        logger.info('✅ Memory Redis connected successfully');
    } catch (err: any) {
        logger.error('❌ Failed to connect to Memory Redis', err);
        process.exit(1);
    }
};

// --- Optional helper to test a key ---
export const testMemoryRedis = async () => {
    try {
        const ping = await memoryRedisClient.ping();
        logger.info(`Memory Redis ping response: ${ping}`);
    } catch (err: any) {
        logger.error('Memory Redis test ping failed', err);
    }
};
