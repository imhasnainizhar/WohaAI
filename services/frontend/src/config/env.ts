import { logger } from "@utils/logger";

// For frontend here best practice for checking **App Environment** and on the basis 
// of .env selecting env file route, is now in next.config.ts file

const p = process.env // Technique for convinience

const secure = (p.NODE_ENV === "production") ? true : false

const sameSite = (p.NODE_ENV === "production" ? "none" : "lax") as
  "none" | "lax" | "strict";

// --- Types for your env config ---
interface EnvConfig {
  NODE_ENV: string;
  NEXT_PUBLIC_AUTH_API_URI: string;
  NEXT_PUBLIC_AUTH_MAILER_API_URI: string;
  NEXT_PUBLIC_USER_API_URI: string;
}

export const env: EnvConfig = {
  NODE_ENV: p.NODE_ENV || "development",
  NEXT_PUBLIC_AUTH_API_URI: p.NEXT_PUBLIC_AUTH_API_URI!,
  NEXT_PUBLIC_AUTH_MAILER_API_URI: p.NEXT_PUBLIC_AUTH_MAILER_API_URI!,
  NEXT_PUBLIC_USER_API_URI: p.NEXT_PUBLIC_USER_API_URI!
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