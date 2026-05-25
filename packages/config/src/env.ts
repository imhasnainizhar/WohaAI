import { EnvConfig } from "./EnvConfig";
import { loadEnv } from "./env/load";
import { validateEnv } from "./env/validate-env";

loadEnv();

const p = process.env;

const secure = p.NODE_ENV === "production";
const NODE_ENV = p.NODE_ENV || "development"

const sameSite = (NODE_ENV === "production" ? "none" : "lax") as
  "none" | "lax" | "strict";


export const env: EnvConfig = {
  // ========================================
  // Environment
  // ========================================

  NODE_ENV: p.NODE_ENV!,

  // ========================================
  // Client configs
  // ========================================

  CLIENT_ORIGIN: p.CLIENT_ORIGIN!,

  // ========================================
  // Logging
  // ========================================

  LOG_LEVEL: p.LOG_LEVEL!,

  // ========================================
  // ReCaptcha
  // ========================================

  APP_PUBLIC_RECAPTCHA_SITE_KEY:
    p.APP_PUBLIC_RECAPTCHA_SITE_KEY!,

  RECAPTCHA_SECRET_KEY:
    p.RECAPTCHA_SECRET_KEY!,

  // ========================================
  // Service Ports
  // ========================================

  USER_SERVICE_PORT:
    p.USER_SERVICE_PORT!,

  AUTH_SERVICE_PORT:
    p.AUTH_SERVICE_PORT!,

  MCP_GATEWAY_PORT:
    p.MCP_GATEWAY_PORT!,

  WEB_SEARCH_MCP_PORT:
    p.WEB_SEARCH_MCP_PORT!,

  AI_AGENT_PORT:
    p.AI_AGENT_PORT!,

  // ========================================
  // Cookie Security
  // ========================================

  SECURE_COOKIE_OPTION: secure,

  SAME_SITE_COOKIE_OPTION: sameSite,

  // ========================================
  // JWT Secrets
  // ========================================

  JWT_ACCESS_SECRET_KEY:
    p.JWT_ACCESS_SECRET_KEY!,

  JWT_REFRESH_SECRET_KEY:
    p.JWT_REFRESH_SECRET_KEY!,

  JWT_PRIVATE_ACCESS_SECRET_KEY:
    p.JWT_PRIVATE_ACCESS_SECRET_KEY!,

  JWT_SIGNUP_SESSION_SECRET_KEY:
    p.JWT_SIGNUP_SESSION_SECRET_KEY!,

  // ========================================
  // Token Names
  // ========================================

  REFRESH_TOKEN_NAME:
    p.REFRESH_TOKEN_NAME!,

  ACCESS_TOKEN_NAME:
    p.ACCESS_TOKEN_NAME!,

  PRIVATE_ACCESS_TOKEN_NAME:
    p.PRIVATE_ACCESS_TOKEN_NAME!,

  SIGNUP_SESSION_TOKEN_NAME:
    p.SIGNUP_SESSION_TOKEN_NAME!,

  // ========================================
  // Redis Cache Keys
  // ========================================

  ACTIVE_SIGNIN_SESSION_CACHE_KEY:
    p.ACTIVE_SIGNIN_SESSION_CACHE_KEY!,

  ACTIVE_SIGNUP_SESSION_CACHE_KEY:
    p.ACTIVE_SIGNUP_SESSION_CACHE_KEY!,

  // ========================================
  // API Keys
  // ========================================

  OPENAI_API_KEY:
    p.OPENAI_API_KEY!,

  SERPER_API_KEY:
    p.SERPER_API_KEY!,

  // ========================================
  // Mailer
  // ========================================

  MAILER_HOST:
    p.MAILER_HOST!,

  MAILER_PORT:
    Number(p.MAILER_PORT),

  MAILER_USER_EMAIL:
    p.MAILER_USER_EMAIL!,

  MAILER_USER_PASSWORD:
    p.MAILER_USER_PASSWORD!,

  MAILER_EMAIL_FROM:
    p.MAILER_EMAIL_FROM!,

  MAILER_SECURE:
    p.MAILER_SECURE!,

  // ========================================
  // Next.js Public APIs
  // ========================================

  NEXT_PUBLIC_AUTH_API_URI:
    p.NEXT_PUBLIC_AUTH_API_URI!,

  NEXT_PUBLIC_AUTH_MAILER_API_URI:
    p.NEXT_PUBLIC_AUTH_MAILER_API_URI!,

  NEXT_PUBLIC_USER_API_URI:
    p.NEXT_PUBLIC_USER_API_URI!,

  // ========================================
  // Users PostgreSQL
  // ========================================

  USERS_PRISMA_DB_URI:
    p.USERS_PRISMA_DB_URI!,

  USERS_POSTGRES_DB_PORT:
    Number(p.USERS_POSTGRES_DB_PORT),

  // ========================================
  // Threads PostgreSQL
  // ========================================

  THREADS_PRISMA_DB_URI:
    p.THREADS_PRISMA_DB_URI!,

  THREADS_POSTGRES_DB_PORT:
    Number(p.THREADS_POSTGRES_DB_PORT),

  // ========================================
  // Auth Redis
  // ========================================

  AUTH_SESSION_STORE_URI:
    p.AUTH_SESSION_STORE_URI!,

  AUTH_SESSION_REDIS_USERNAME:
    p.AUTH_SESSION_REDIS_USERNAME!,

  AUTH_SESSION_STORE_PASSWORD:
    p.AUTH_SESSION_STORE_PASSWORD!,

  // ========================================
  // Agent Memory Redis
  // ========================================

  AGENT_MEMORY_REDIS_URI:
    p.AGENT_MEMORY_REDIS_URI!,

  AGENT_MEMORY_REDIS_USERNAME:
    p.AGENT_MEMORY_REDIS_USERNAME!,

  AGENT_MEMORY_REDIS_PASSWORD:
    p.AGENT_MEMORY_REDIS_PASSWORD!,

  // ========================================
  // Threads Redis
  // ========================================

  THREADS_HISTORY_REDIS_URI:
    p.THREADS_HISTORY_REDIS_URI!,

  THREADS_HISTORY_REDIS_USERNAME:
    p.THREADS_HISTORY_REDIS_USERNAME!,

  THREADS_HISTORY_REDIS_PASSWORD:
    p.THREADS_HISTORY_REDIS_PASSWORD!,

  // ========================================
  // Qdrant
  // ========================================

  AGENT_MEMORY_QDRANT_URI:
    p.AGENT_MEMORY_QDRANT_URI!,

  AGENT_MEMORY_QDRANT_API_KEY:
    Number(p.AGENT_MEMORY_QDRANT_API_KEY),

  // ========================================
  // Kafka Broker Connection
  // ========================================

  AUTH_MAILER_KAFKA_BROKER_HOST:
    p.AUTH_MAILER_KAFKA_BROKER_HOST!,

  AUTH_MAILER_KAFKA_BROKER_PORT:
    Number(
      p.AUTH_MAILER_KAFKA_BROKER_PORT,
    ),

  AUTH_MAILER_KAFKA_BROKER_URI:
    p.AUTH_MAILER_KAFKA_BROKER_URI!,

  AUTH_MAILER_KAFKA_BROKERS:
    p.AUTH_MAILER_KAFKA_BROKERS!.split(
      ",",
    ),

  // ========================================
  // Kafka Listeners
  // ========================================

  KAFKA_CFG_LISTENERS:
    p.KAFKA_CFG_LISTENERS!,

  KAFKA_CFG_ADVERTISED_LISTENERS:
    p.KAFKA_CFG_ADVERTISED_LISTENERS!,

  // ========================================
  // Kafka Client Identity
  // ========================================

  AUTH_MAILER_KAFKA_CLIENT_ID:
    p.AUTH_MAILER_KAFKA_CLIENT_ID!,

  // ========================================
  // Kafka Security
  // ========================================

  AUTH_MAILER_KAFKA_USERNAME:
    p.AUTH_MAILER_KAFKA_USERNAME!,

  AUTH_MAILER_KAFKA_PASSWORD:
    p.AUTH_MAILER_KAFKA_PASSWORD!,

  // ========================================
  // Kafka Topics
  // ========================================

  AUTH_MAILER_KAFKA_TOPIC_PREFIX:
    p.AUTH_MAILER_KAFKA_TOPIC_PREFIX!,

  AUTH_MAILER_KAFKA_USER_EVENTS_TOPIC:
    p.AUTH_MAILER_KAFKA_USER_EVENTS_TOPIC!,

  AUTH_MAILER_KAFKA_SIGNUP_EVENTS_TOPIC:
    p.AUTH_MAILER_KAFKA_SIGNUP_EVENTS_TOPIC!,
};

export const envConfigs = validateEnv(env);