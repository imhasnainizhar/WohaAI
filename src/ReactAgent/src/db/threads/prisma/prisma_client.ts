import { PrismaClient } from "@generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { env } from "@config/env.config.js";

// Prisma 7: Use adapter for database connection
const pool = new Pool({
  connectionString: env.THREADS_POSTGRES_DB_URI,
});

const adapter = new PrismaPg(pool);

export const prismaClient = new PrismaClient({ adapter });
