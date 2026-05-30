import "dotenv/config"; // .env
import { defineConfig } from "prisma/config";
import envConfig from '@packages/config';

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: { path: "prisma/migrations" },
  datasource: { url: envConfig.envConfigs.THREADS_PRISMA_DB_URI!},
});