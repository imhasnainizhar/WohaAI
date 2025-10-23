import dotenv from "dotenv";
import path from "path";

// Include this condition where you wnt to get monorepo parent .env file for dev environment testing
// This is used in config files to get env from .env file for development
// Where we will get env variables for production from infra
if (process.env.NODE_ENV !== "production") {
  dotenv.config({ path: path.resolve(__dirname, "../../../../../.env") });
}

const p = process.env // Technique for convinience

const secure = (p.NODE_ENV === "production") ? true : false

const sameSite = (p.NODE_ENV === "production" ? "none" : "lax") as
  "none" | "lax" | "strict";

export const env = {
  NODE_ENV: p.NODE_ENV || "development",
  AUTH_MAILER_SERVICE_PORT: p.AUTH_MAILER_SERVICE_PORT,
  LOG_LEVEL: p.LOG_LEVEL,
  SECURE_COOKIE_OPTION: secure,
  SAME_SITE_COOKIE_OPTION: sameSite,

  MAILER_PORT: p.MAILER_PORT,
  MAILER_EMAIL_USER: p.MAILER_EMAIL_USER,
  MAILER_EMAIL_PASS: p.MAILER_EMAIL_PASS,
  MAILER_EMAIL_FROM: p.MAILER_EMAIL_FROM,
  MAIL_SECURE: p.MAIL_SECURE,
  MAILER_HOST: p.MAILER_HOST,
};
