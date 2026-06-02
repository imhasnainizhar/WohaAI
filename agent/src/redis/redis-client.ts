import { env } from '@/config/env.js';
import { RedisClient } from '@packages/redis';

export const redisClient = new RedisClient(env.AGENT_MEMORY_REDIS_URI)