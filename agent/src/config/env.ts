// import dotenvExpand from "dotenv-expand";
import dotenv from "dotenv";
import process from "process";
import path from "path";
import { logger } from "../logger/logger.js";
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
    // Qdrant store for memories for old chat sessions.
    MEMORY_QDRANT_STORE_URI: string;
    MEMORY_QDRANT_STORE_PORT: number;

    // Postgres store for threads.
    THREADS_PRISMA_DB_URI: string;
    THREADS_POSTGRES_DB_PORT: number;

    // Redis store for caching memories in live chat session.
    MEMORY_REDIS_STORE_URI: string;
    MEMORY_REDIS_STORE_PASSWORD: string;
    MEMORY_REDIS_STORE_USERNAME: string;

    // Redis store for caching threads in live chat session.
    THREADS_REDIS_STORE_URI: string;
    THREADS_REDIS_STORE_PASSWORD: string;
    THREADS_REDIS_STORE_USERNAME: string;

    // Other environment configs...
    NODE_ENV: string;
    WOAHAI_LLM_AGENT_PORT: string;
    LOG_LEVEL: string;
    OPENAI_API_KEY: string;
    MCP_GATEWAY_PORT: number;
}

// ✅ Build environment object
export const env: EnvConfig = {
    // Qdrant store for memories for old chat sessions.
    MEMORY_QDRANT_STORE_URI: p.MEMORY_QDRANT_STORE_URI!,
    MEMORY_QDRANT_STORE_PORT: parseInt(p.MEMORY_QDRANT_STORE_PORT!, 10),

    // Postgres store for threads.
    THREADS_PRISMA_DB_URI: p.THREADS_PRISMA_DB_URI!,
    THREADS_POSTGRES_DB_PORT: parseInt(p.THREADS_POSTGRES_DB_PORT!, 10),

    // Redis store for caching memories in live chat session.
    MEMORY_REDIS_STORE_URI: p.MEMORY_REDIS_STORE_URI!,
    MEMORY_REDIS_STORE_PASSWORD: p.MEMORY_REDIS_STORE_PASSWORD!,
    MEMORY_REDIS_STORE_USERNAME: p.MEMORY_REDIS_STORE_USERNAME!,

    // Redis store for caching threads in live chat session.
    THREADS_REDIS_STORE_URI: p.THREADS_REDIS_STORE_URI!,
    THREADS_REDIS_STORE_PASSWORD: p.THREADS_REDIS_STORE_PASSWORD!,
    THREADS_REDIS_STORE_USERNAME: p.THREADS_REDIS_STORE_USERNAME!,

    // Other environment configs...
    NODE_ENV: p.NODE_ENV || "development",
    WOAHAI_LLM_AGENT_PORT: p.WOAHAI_LLM_AGENT_PORT!,
    LOG_LEVEL: p.LOG_LEVEL || "debug",
    OPENAI_API_KEY: p.OPENAI_API_KEY!,
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
