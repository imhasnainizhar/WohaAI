// Interface for your env config
interface EnvConfig {
  // Env
  NODE_ENV: string;

  // Ports Env variables
  USER_SERVICE_PORT: string;
  AUTH_SERVICE_PORT: string;
  MCP_GATEWAY_PORT: string;
  WEB_SEARCH_MCP_PORT: string;
  WOAHAI_LLM_AGENT_PORT: string;

  // Cookie Security options
  SECURE_COOKIE_OPTION: boolean;
  SAME_SITE_COOKIE_OPTION: "lax" | "strict" | "none";

  // DB URI configs
  USERS_PRISMA_DB_URI: string;
  AUTH_REDIS_STORE_URI: string;

  // JWT key
  JWT_ACCESS_SECRET_KEY: string;
  JWT_REFRESH_SECRET_KEY: string;
  JWT_PRIVATE_ACCESS_SECRET_KEY: string;
  JWT_SIGNUP_SESSION_SECRET_KEY: string;

  // Token names
  REFRESH_TOKEN_NAME: string;
  ACCESS_TOKEN_NAME: string;
  PRIVATE_ACCESS_TOKEN_NAME: string;
  SIGNUP_SESSION_TOKEN_NAME: string;

  // Client configs
  CLIENT_ORIGIN: string;
  COOKIE_DOMAIN: string;

  // Log configs
  LOG_LEVEL: string

  // API keys
  OPENAI_API_KEY: string;
  SERPER_API_KEY: string;

  // Kafka configs
  KAFKA_AUTH_BROKERS: string;
  KAFKA_AUTH_CLIENT_ID: string;
  KAFKA_SIGNUP_EMAIL_EVENTS: string;

  // Next.js NEXT_* Env Variables
  NEXT_PUBLIC_AUTH_API_URI: string;
  NEXT_PUBLIC_AUTH_MAILER_API_URI: string;
  NEXT_PUBLIC_USER_API_URI: string;

  // Qdrant store for memories for old chat sessions.
  MEMORY_QDRANT_STORE_URI: string;
  MEMORY_QDRANT_STORE_PORT: number;

  // Postgres store for threads.
  THREADS_PRISMA_DB_URI: string;
  THREADS_POSTGRES_DB_PORT: number;

  // Redis store for caching memories in live chat session.
  MEMORY_REDIS_STORE_URI: string;
  MEMORY_REDIS_STORE_PASSWORD: string;
  MEMORY_REDIS_STORE_USERNAME: string;

  // Redis store for caching threads in live chat session.
  THREADS_REDIS_STORE_URI: string;
  THREADS_REDIS_STORE_PASSWORD: string;
  THREADS_REDIS_STORE_USERNAME: string;
}

const p = process.env;

const secure = p.NODE_ENV === "production";

const sameSite = (p.NODE_ENV === "production" ? "none" : "lax") as
  "none" | "lax" | "strict";

export const env: EnvConfig = {
  // Env
  NODE_ENV: p.NODE_ENV || "development",

  // Ports Env variables
  USER_SERVICE_PORT: p.USER_SERVICE_PORT!,
  AUTH_SERVICE_PORT: p.AUTH_SERVICE_PORT!,
  MCP_GATEWAY_PORT: p.MCP_GATEWAY_PORT!,
  WEB_SEARCH_MCP_PORT: p.WEB_SEARCH_MCP_PORT!,
  WOAHAI_LLM_AGENT_PORT: p.WOAHAI_LLM_AGENT_PORT!,

  // Cookie Security options
  SECURE_COOKIE_OPTION: secure,
  SAME_SITE_COOKIE_OPTION: sameSite,

  // DB URI configs
  USERS_PRISMA_DB_URI: p.USERS_PRISMA_DB_URI!,
  AUTH_REDIS_STORE_URI: p.AUTH_REDIS_STORE_URI!,

  // JWT key
  JWT_ACCESS_SECRET_KEY: p.JWT_ACCESS_SECRET_KEY || "",
  JWT_REFRESH_SECRET_KEY: p.JWT_REFRESH_SECRET_KEY || "",
  JWT_PRIVATE_ACCESS_SECRET_KEY: p.JWT_PRIVATE_ACCESS_SECRET_KEY || "",
  JWT_SIGNUP_SESSION_SECRET_KEY: p.JWT_SIGNUP_SESSION_SECRET_KEY || "",

  // Token names
  REFRESH_TOKEN_NAME: p.REFRESH_TOKEN_NAME || "",
  ACCESS_TOKEN_NAME: p.ACCESS_TOKEN_NAME || "",
  PRIVATE_ACCESS_TOKEN_NAME: p.PRIVATE_ACCESS_TOKEN_NAME || "",
  SIGNUP_SESSION_TOKEN_NAME: p.SIGNUP_SESSION_TOKEN_NAME || "",

  // Client configs
  CLIENT_ORIGIN: p.CLIENT_ORIGIN!,
  COOKIE_DOMAIN: p.COOKIE_DOMAIN!,

  // Log configs
  LOG_LEVEL: p.LOG_LEVEL || "info",

  // API keys
  OPENAI_API_KEY: p.OPENAI_API_KEY || "",
  SERPER_API_KEY: p.SERPER_API_KEY || "",

  // Kafka configs
  KAFKA_AUTH_BROKERS: p.KAFKA_AUTH_BROKERS || "",
  KAFKA_AUTH_CLIENT_ID: p.KAFKA_AUTH_CLIENT_ID || "",
  KAFKA_SIGNUP_EMAIL_EVENTS: p.KAFKA_SIGNUP_EMAIL_EVENTS || "",

  // Next.js NEXT_* Env Variables
  NEXT_PUBLIC_AUTH_API_URI: p.NEXT_PUBLIC_AUTH_API_URI || "",
  NEXT_PUBLIC_AUTH_MAILER_API_URI: p.NEXT_PUBLIC_AUTH_MAILER_API_URI || "",
  NEXT_PUBLIC_USER_API_URI: p.NEXT_PUBLIC_USER_API_URI || "",

  // Qdrant store
  MEMORY_QDRANT_STORE_URI: p.MEMORY_QDRANT_STORE_URI || "",
  MEMORY_QDRANT_STORE_PORT: Number(p.MEMORY_QDRANT_STORE_PORT || 0),

  // Postgres threads store
  THREADS_PRISMA_DB_URI: p.THREADS_PRISMA_DB_URI || "",
  THREADS_POSTGRES_DB_PORT: Number(p.THREADS_POSTGRES_DB_PORT || 0),

  // Redis memory store
  MEMORY_REDIS_STORE_URI: p.MEMORY_REDIS_STORE_URI || "",
  MEMORY_REDIS_STORE_PASSWORD: p.MEMORY_REDIS_STORE_PASSWORD || "",
  MEMORY_REDIS_STORE_USERNAME: p.MEMORY_REDIS_STORE_USERNAME || "",

  // Redis threads store
  THREADS_REDIS_STORE_URI: p.THREADS_REDIS_STORE_URI || "",
  THREADS_REDIS_STORE_PASSWORD: p.THREADS_REDIS_STORE_PASSWORD || "",
  THREADS_REDIS_STORE_USERNAME: p.THREADS_REDIS_STORE_USERNAME || "",
};