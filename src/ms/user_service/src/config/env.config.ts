import path from "path";
import dotenv from "dotenv";

// Include this condition where you wnt to get monorepo parent .env file for dev environment testing
// This is used in config files to get env from .env file for development
// Where we will get env variables for production from infra
if (process.env.NODE_ENV !== "production") {
  dotenv.config({ path: path.resolve(__dirname, "../../../../../.env") });
}

const p = process.env
export const env = {
  NODE_ENV: p.NODE_ENV || "development",
  USER_SERVICE_PORT: p.USER_SERVICE_PORT,
  CLIENT_ORIGIN: p.CLIENT_ORIGIN,
  LOG_LEVEL: p.LOG_LEVEL,

  PRISMA_USER_DATABASE_URI: p.PRISMA_USER_DATABASE_URI!,
  REDIS_CODE_C_URI: p.REDIS_CODE_C_URI,

  JWT_ACCESS_SECRET_KEY: process.env.JWT_ACCESS_SECRET_KEY || "",
  JWT_REFRESH_SECRET_KEY: process.env.JWT_REFRESH_SECRET_KEY || "",
  JWT_PRIVATE_ACCESS_SECRET_KEY: process.env.JWT_PRIVATE_ACCESS_SECRET_KEY || "",

  // Token names for checking or creating token easily, without writing complex names of tokens again 
  // and again in code multiple times.
  REFRESH_TOKEN_NAME: process.env.REFRESH_TOKEN_NAME || "",
  ACCESS_TOKEN_NAME: process.env.ACCESS_TOKEN_NAME || "",
  PRIVATE_ACCESS_TOKEN_NAME: process.env.PRIVATE_ACCESS_TOKEN_NAME || "",

};
