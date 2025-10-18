import dotenv from "dotenv";
import process from "process";
dotenv.config();

export const env = {
  NODE_ENV: process.env.NODE_ENV || "development",
  AUTH_SERVICE_PORT: process.env.AUTH_SERVICE_PORT,

  DATABASE_URL: process.env.DATABASE_URL || "",
  JWT_SECRET: process.env.JWT_SECRET || "",
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || "",

  CLIENT_URL: process.env.CLIENT_URL,

  COOKIE_DOMAIN: process.env.COOKIE_DOMAIN,
};
