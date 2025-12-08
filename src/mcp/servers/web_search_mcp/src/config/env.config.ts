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
        : path.resolve(__dirname, "../../.env"); // local monorepo
    // const envResult = dotenv.config({ path: envPath });
    dotenv.config({ path: envPath });
    // dotenvExpand.expand(envResult);
    logger.debug(`Loaded environment from: ${envPath}`);
}

const secure = (p.NODE_ENV === "production") ? true : false

const sameSite = (p.NODE_ENV === "production" ? "none" : "lax") as
    "none" | "lax" | "strict";

// --- Types for your env config ---
interface EnvConfig {
    NODE_ENV: string;
    WEB_BROWSER_MCP_PORT: string;
    LOG_LEVEL: string;
    SECURE_COOKIE_OPTION: boolean;
    SAME_SITE_COOKIE_OPTION: "none" | "lax" | "strict";
    SERPER_API_KEY: string;
}

// ✅ Build environment object
export const env: EnvConfig = {
    NODE_ENV: p.NODE_ENV || "development",
    WEB_BROWSER_MCP_PORT: p.WEB_BROWSER_MCP_PORT!,
    LOG_LEVEL: p.LOG_LEVEL || "debug",
    SECURE_COOKIE_OPTION: secure,
    SAME_SITE_COOKIE_OPTION: sameSite,
    SERPER_API_KEY: p.SERPER_API_KEY!,
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

logger.info("✅ All environment variables loaded correctly");
