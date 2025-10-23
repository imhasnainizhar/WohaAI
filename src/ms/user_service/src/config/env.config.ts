import path from "path";
import dotenv from "dotenv";

// Include this condition where you wnt to get monorepo parent .env file for dev environment testing
// This is used in config files to get env from .env file for development
// Where we will get env variables for production from infra
if (process.env.NODE_ENV !== "production") {
  dotenv.config({ path: path.resolve(__dirname, "../../../../../.env") });
}

const p = process.env

const secure = (p.NODE_ENV === "production") ? true : false

const sameSite = (p.NODE_ENV === "production" ? "none" : "lax") as
  "none" | "lax" | "strict";

export const env = {
  NODE_ENV: p.NODE_ENV || "development",
  USER_SERVICE_PORT: p.USER_SERVICE_PORT,
  CLIENT_ORIGIN: p.CLIENT_ORIGIN,
  LOG_LEVEL: p.LOG_LEVEL,
  SECURE_COOKIE_OPTION: secure,
  SAME_SITE_COOKIE_OPTION: sameSite,

  PRISMA_USER_DATABASE_URI: p.PRISMA_USER_DATABASE_URI!,
  REDIS_CODE_C_URI: p.REDIS_CODE_C_URI,
};
