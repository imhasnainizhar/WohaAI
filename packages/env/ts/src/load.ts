import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import dotenvExpand from "dotenv-expand";

let loaded = false;

function findRepoRoot(start: string) {
  let dir = start;

  while (dir !== path.dirname(dir)) {
    if (
      fs.existsSync(path.join(dir, "pnpm-workspace.yaml")) ||
      fs.existsSync(path.join(dir, "turbo.json")) ||
      fs.existsSync(path.join(dir, ".git"))
    ) {
      return dir;
    }

    dir = path.dirname(dir);
  }

  return null;
}

export function loadEnv() {
  if (loaded) return;

  // ❗ Always safe in Node; no need for typeof process check
  if (process.env.NODE_ENV === "production") {
    loaded = true;
    return;
  }

  const root = findRepoRoot(__dirname);

  if (!root) {
    loaded = true;
    return;
  }

  const envPath = path.join(root, ".env");

  if (fs.existsSync(envPath)) {
    dotenvExpand.expand(
      dotenv.config({ path: envPath })
    );
  }

  loaded = true;
}