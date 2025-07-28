import Redis from "ioredis";

const host = process.env.REDIS_HOST;
const port = process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT) : 6379;
const password = process.env.REDIS_CLIENT_PASSWORD;

const redisClient = new Redis({
  host,
  port,
  password,
});

redisClient.on("connect", () => {
  console.log("✅ Connected to Redis (ioredis)");
});

redisClient.on("error", (err) => {
  console.error("❌ Redis connection error:", err);
});

export default redisClient;
