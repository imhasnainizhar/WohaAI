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
    // const envResult = dotenv.config({ path: envPath });
    dotenv.config({ path: envPath });
    // dotenvExpand.expand(envResult);
    logger.debug(`Loaded environment from: ${envPath}`);
}

// --- Types for your env config ---
interface EnvConfig {
    NODE_ENV: string;
    WOAHAI_LLM_AGENT_PORT: string;
    AGENT_MEMORY_DB_URI: string,
    LOG_LEVEL: string;
    OPENAI_API_KEY: string;
    MCP_GATEWAY_PORT: number;
}

// ✅ Build environment object
export const env: EnvConfig = {
    NODE_ENV: p.NODE_ENV || "development",
    WOAHAI_LLM_AGENT_PORT: p.WEB_SEARCH_MCP_PORT!,
    LOG_LEVEL: p.LOG_LEVEL || "debug",
    OPENAI_API_KEY: p.OPENAI_API_KEY!,
    AGENT_MEMORY_DB_URI: p.AGENT_MEMORY_DB_URI!,
    MCP_GATEWAY_PORT: parseInt(p.MCP_GATEWAY_PORT!, 10),
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
