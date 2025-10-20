import dotenv from "dotenv";
import path from "path";

// Include this condition where you wnt to get monorepo parent .env file for dev environment testing
// This is used in config files to get env from .env file for development
// Where we will get env variables for production from infra
if (process.env.NODE_ENV !== "production") {
  dotenv.config({ path: path.resolve(__dirname, "../../../../../.env") });
}

const p = process.env // Technique for convinience
export const env = {
  NODE_ENV: p.NODE_ENV || "development",
  AUTH_MAILER_SERVICE_PORT: p.AUTH_MAILER_SERVICE_PORT,
  PRISMA_USER_DATABASE_URI: p.PRISMA_USER_DATABASE_URI!,
  REDIS_CODE_C_URI: p.REDIS_CODE_C_URI,


  MAILER_PORT: p.MAILER_PORT,
  MAILER_EMAIL_USER: p.MAILER_EMAIL_USER,
  MAILER_EMAIL_PASS: p.MAILER_EMAIL_PASS,
  MAILER_EMAIL_FROM: p.MAILER_EMAIL_FROM,
  MAIL_SECURE: p.MAIL_SECURE,
  MAILER_HOST: p.MAILER_HOST,
};
