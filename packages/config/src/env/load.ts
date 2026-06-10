import dotenv from "dotenv";
import dotenvExpand from "dotenv-expand";
import path from "path";

const isDocker =
  process.env.RUNNING_IN_DOCKER === "true";

const isProduction = process.env.NODE_ENV === "production";

function loadFile(filePath: string) {
  const result = dotenv.config({ path: filePath });
  dotenvExpand.expand(result);
}

export function loadEnv() {
  if (isProduction) return;

  const basePath = isDocker
    ? path.resolve("/app/.env")
    : path.resolve(__dirname, "../../../../.env");

  loadFile(basePath);
}