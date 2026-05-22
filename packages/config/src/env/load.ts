import dotenv from "dotenv";
import dotenvExpand from "dotenv-expand";
import path from "path";
import { existsSync } from "fs";

const isDocker = existsSync("/.dockerenv");
const isProduction = process.env.NODE_ENV === "production";

if (!isProduction) {
  const envPath = isDocker
    ? path.resolve("/app/.env")
    : path.resolve(process.cwd(), ".env");

  const result = dotenv.config({ path: envPath });
  dotenvExpand.expand(result);
}