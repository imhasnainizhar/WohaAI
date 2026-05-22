import { defineConfig } from "prisma/config";
import * as fs from "fs";
import * as path from "path";
import * as dotenv from "dotenv";

let envPathForServices;
const inDocker  = fs.existsSync("../../.dockerenv")
// For docker development
if ( inDocker )  envPathForServices = path.resolve(__dirname, "../../.env");
// For local development
envPathForServices = path.resolve(__dirname, "../../.env.local");

if (fs.existsSync(envPathForServices)) {
  dotenv.config({ path: envPathForServices });
}

export default defineConfig({
  schema: "./prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env["USERS_PRISMA_DB_URI"]!,
  },
});
