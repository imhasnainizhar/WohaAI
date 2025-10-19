import dotenv from "dotenv";
import process from "process";
dotenv.config();

export const env = {
  NODE_ENV: process.env.NODE_ENV || "development",
  AUTH_SERVICE_PORT: process.env.AUTH_SERVICE_PORT,

  DATABASE_URL: process.env.DATABASE_URL || "",

  JWT_ACCESS_SECRET_KEY: process.env.JWT_ACCESS_SECRET_KEY || "",
  JWT_REFRESH_SECRET_KEY: process.env.JWT_REFRESH_SECRET_KEY || "",
  JWT_PRIVATE_ACCESS_SECRET_KEY: process.env.JWT_PRIVATE_ACCESS_SECRET_KEY || "",

  // Token names for checking or creating token easily, without writing complex names of tokens again 
  // and again in code multiple times.
  REFRESH_TOKEN_NAME: process.env.REFRESH_TOKEN_NAME || "",
  ACCESS_TOKEN_NAME: process.env.ACCESS_TOKEN_NAME || "",
  PRIVATE_ACCESS_TOKEN_NAME: process.env.PRIVATE_ACCESS_TOKEN_NAME || "",

  CLIENT_URL: process.env.CLIENT_URL,

  COOKIE_DOMAIN: process.env.COOKIE_DOMAIN,
};
