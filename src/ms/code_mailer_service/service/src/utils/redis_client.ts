import Redis from "ioredis";

const redisClient = new Redis(process.env.REDIS_CODE_C!);

redisClient.on("connect", () => console.log("✅ Connected to Redis (ioredis)"));  
redisClient.on("error", (err) => console.error("❌ Redis connection error:", err));

export default redisClient;
