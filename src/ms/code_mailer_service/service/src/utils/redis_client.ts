import Redis from "ioredis";

const host = process.env.REDIS_CODE_C;
const port = process.env.REDIS_SERVER_PORT_01 ? parseInt(process.env.REDIS_SERVER_PORT_01) : 6379;
const password = process.env.REDIS_PASSWORD_CODE_C;

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
