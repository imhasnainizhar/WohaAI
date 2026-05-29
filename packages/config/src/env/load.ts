import dotenv from "dotenv";
import dotenvExpand from "dotenv-expand";
import path from "path";
import { existsSync } from "fs";

const isDocker = existsSync("/.dockerenv");
const isProduction = process.env.NODE_ENV === "production";

function loadFile(filePath: string) {
  if (existsSync(filePath)) {
    const result = dotenv.config({ path: filePath });
    dotenvExpand.expand(result);
  }
}

export function loadEnv() {
  if (isProduction) return;

  const basePath = isDocker
    ? path.resolve("/app/.env")
    : path.resolve(__dirname, "../../../../.env");

  const localPath = 
    path.resolve(__dirname, "../../../../.env.local");

  // base config (base is docker default)
  // loadFile(basePath);

  // overrides docker for local dev (IMPORTANT: loaded after base)
  loadFile(localPath);
}