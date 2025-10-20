import process from "process";
import path from "path";
import dotenv from "dotenv";

// Include this condition where you wnt to get monorepo parent .env file for dev environment testing
// This is used in config files to get env from .env file for development
// Where we will get env variables for production from infra
if (process.env.NODE_ENV !== "production") {
  dotenv.config({ path: path.resolve(__dirname, "../../../../../.env") });
}

const p = process.env // Technique for convinience
export const env = {
  NODE_ENV: process.env.NODE_ENV || "development",
  AUTH_SERVICE_PORT: process.env.AUTH_SERVICE_PORT,

  PRISMA_USER_DATABASE_URI: p.PRISMA_USER_DATABASE_URI!,

  REDIS_CODE_C_URI: p.REDIS_CODE_C_URI,
  REDIS_PASSWORD_CODE_C: p.REDIS_PASSWORD_CODE_C,
  REDIS_CODE_C_PORT: p.REDIS_CODE_C_PORT,

  JWT_ACCESS_SECRET_KEY: process.env.JWT_ACCESS_SECRET_KEY || "",
  JWT_REFRESH_SECRET_KEY: process.env.JWT_REFRESH_SECRET_KEY || "",
  JWT_PRIVATE_ACCESS_SECRET_KEY: process.env.JWT_PRIVATE_ACCESS_SECRET_KEY || "",

  // Token names for checking or creating token easily, without writing complex names of tokens again 
  // and again in code multiple times.
  REFRESH_TOKEN_NAME: process.env.REFRESH_TOKEN_NAME || "",
  ACCESS_TOKEN_NAME: process.env.ACCESS_TOKEN_NAME || "",
  PRIVATE_ACCESS_TOKEN_NAME: process.env.PRIVATE_ACCESS_TOKEN_NAME || "",

  CLIENT_ORIGIN: process.env.CLIENT_ORIGIN,

  COOKIE_DOMAIN: process.env.COOKIE_DOMAIN,
};
