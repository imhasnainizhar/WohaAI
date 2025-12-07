"use server";

// import dotenvExpand from "dotenv-expand";
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
    : path.resolve(__dirname, "../../../../.env"); // local monorepo
  dotenv.config({ path: envPath });
//   dotenvExpand.expand(envResult);
  logger.debug(`Loaded environment from: ${envPath}`);
}

const secure = (p.NODE_ENV === "production") ? true : false

const sameSite = (p.NODE_ENV === "production" ? "none" : "lax") as
  "none" | "lax" | "strict";

// --- Types for your env config ---
interface EnvConfig {
  NODE_ENV: string;
  AUTH_SERVICE_PORT: string;
  USER_SERVICE_URI: string
}

export const env: EnvConfig = {
  NODE_ENV: p.NODE_ENV || "development",
  AUTH_SERVICE_PORT: p.AUTH_SERVICE_PORT!,
  USER_SERVICE_URI: p.NEXT_PUBLIC_USER_API_URI!,
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
} else {
    logger.info("✅ All environment variables loaded correctly");
}