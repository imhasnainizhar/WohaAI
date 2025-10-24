import dotenvExpand from "dotenv-expand";
import dotenv from "dotenv";
import process from "process";
import path from "path";
import { logger } from "@utils/logger";
import { existsSync } from "fs";

const p = process.env // Technique for convinience

// Include this condition where you wnt to get monorepo parent .env file for dev environment testing
// This is used in config files to get env from .env file for development
// Where we will get env variables for production from infra

const isDocker = existsSync("/.dockerenv");
const isProduction = p.NODE_ENV === "production";

if (!isProduction) {
  const envPath = isDocker
    ? path.resolve("/app/.env") // inside container
    : path.resolve(__dirname, "../../../../../.env"); // local monorepo
  const envResult = dotenv.config({ path: envPath });
  dotenvExpand.expand(envResult);
  logger.debug(`Loaded environment from: ${envPath}`);
}

const secure = (p.NODE_ENV === "production") ? true : false

const sameSite = (p.NODE_ENV === "production" ? "none" : "lax") as
  "none" | "lax" | "strict";

// --- Types for your env config ---
interface EnvConfig {
  NODE_ENV: string;
  AUTH_SERVICE_PORT: string;
  SECURE_COOKIE_OPTION: boolean;
  SAME_SITE_COOKIE_OPTION: "lax" | "strict" | "none";

  PRISMA_USER_DATABASE_URI: string;
  REDIS_CODE_C_URI: string;
  REDIS_PASSWORD_CODE_C: string;
  REDIS_CODE_C_PORT: string;

  JWT_ACCESS_SECRET_KEY: string;
  JWT_REFRESH_SECRET_KEY: string;
  JWT_PRIVATE_ACCESS_SECRET_KEY: string;
  JWT_SIGNUP_SESSION_SECRET_KEY: string;

  REFRESH_TOKEN_NAME: string;
  ACCESS_TOKEN_NAME: string;
  PRIVATE_ACCESS_TOKEN_NAME: string;
  SIGNUP_SESSION_TOKEN_NAME: string;
  CLIENT_ORIGIN: string;
  COOKIE_DOMAIN: string;
}

export const EXPIRATION = {
  JWT_ACCESS_SESSION_TOKEN: "45m",
  ACCESS_SESSION_COOKIE: 45 * 60 * 1000, // 15 minutes in ms

  JWT_PRIVATE_ACCESS_SESSION_TOKEN: "10m",
  PRIVATE_ACCESS_SESSION_COOKIE: 10 * 60 * 1000, // 10 minutes in ms

  JWT_REFRESH_SESSION_TOKEN: "365d",
  JWT_REFRESH_REMEMBER_OFF_SESSION_TOKEN: "6h",
  REFRESH_SESSION_COOKIE: 365 * 25 * 60 * 60 * 1000, // 365 days in ms

  JWT_SIGNUP_SESSION_TOKEN: "10m", // 10 minutes in seconds (for email/username validation flow)
  SIGNUP_SESSION_COOKIE: 10 * 60 * 1000, // 10 minutes for cookie, in ms
  REDIS_SIGNUP_SESSION_TTL: 10 * 60, // Match signup session (10 min),

  JWT_SIGNUP_SESSION_TOKEN_EXTENDED: "30m", // 30 minutes in seconds (for post email-verification signup flow)
  SIGNUP_SESSION_COOKIE_EXTENDED: 30 * 60 * 1000, // 30 minutes for cookie, in ms
  REDIS_SIGNUP_SESSION_TTL_EXTENDED: 30 * 60, // Match signup session (30 min)
} ;

export const env: EnvConfig = {
  NODE_ENV: p.NODE_ENV || "development",
  AUTH_SERVICE_PORT: p.AUTH_SERVICE_PORT!,
  SECURE_COOKIE_OPTION: secure,
  SAME_SITE_COOKIE_OPTION: sameSite,

  PRISMA_USER_DATABASE_URI: p.PRISMA_USER_DATABASE_URI!,

  REDIS_CODE_C_URI: p.REDIS_CODE_C_URI!,
  REDIS_PASSWORD_CODE_C: p.REDIS_PASSWORD_CODE_C!,
  REDIS_CODE_C_PORT: p.REDIS_CODE_C_PORT!,

  JWT_ACCESS_SECRET_KEY: p.JWT_ACCESS_SECRET_KEY || "",
  JWT_REFRESH_SECRET_KEY: p.JWT_REFRESH_SECRET_KEY || "",
  JWT_PRIVATE_ACCESS_SECRET_KEY: p.JWT_PRIVATE_ACCESS_SECRET_KEY || "",
  JWT_SIGNUP_SESSION_SECRET_KEY: p.JWT_SIGNUP_SESSION_SECRET_KEY || "",

  // Token names for checking or creating token easily, without writing complex names of tokens again 
  // and again in code multiple times.
  REFRESH_TOKEN_NAME: p.REFRESH_TOKEN_NAME || "",
  ACCESS_TOKEN_NAME: p.ACCESS_TOKEN_NAME || "",
  PRIVATE_ACCESS_TOKEN_NAME: p.PRIVATE_ACCESS_TOKEN_NAME || "",
  SIGNUP_SESSION_TOKEN_NAME: p.SIGNUP_SESSION_TOKEN_NAME!,

  CLIENT_ORIGIN: p.CLIENT_ORIGIN!,

  COOKIE_DOMAIN: p.COOKIE_DOMAIN!,
};

// Dynamic validation: loop through env to detect misconfiguration
const missing: string[] = [];

for (const [key, value] of Object.entries(env)) {
  if (
    value === undefined ||
    value === null ||
    (typeof value === "string" && value.trim() === "")
  ) {
    missing.push(key);
  }
}

if (missing.length > 0) {
  const msg = `❌ Missing or misconfigured environment variables:\n${missing.join("\n")}`;
  logger.fatal(msg);
  throw new Error(msg);
}

logger.fatal("✅ All environment variables loaded correctly");
