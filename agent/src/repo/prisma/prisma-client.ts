import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { env } from "@/config/env.js";
import { agentLogger as logger } from '@packages/observability';

// Prisma 7: Use adapter for database connection
const pool = new Pool({
  connectionString: env.THREADS_PRISMA_DB_URI,
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000, // Close idle clients after 30 seconds
  connectionTimeoutMillis: 10000, // Return an error after 10 seconds if connection cannot be established
});

// Handle pool errors
pool.on('error', (err) => {
  logger.error(`Unexpected error on idle PostgreSQL client: ${err.message}`);
});

// Handle pool connection events
pool.on('connect', () => {
  logger.debug('New PostgreSQL client connected to threads database');
});

pool.on('remove', () => {
  logger.debug('PostgreSQL client removed from pool');
});

const adapter = new PrismaPg(pool);

// Test connection on initialization
pool.query('SELECT NOW()')
  .then(() => {
    logger.info(`✅ Prisma client initialized and connected to threads database`);
  })
  .catch((err) => {
    logger.error(`❌ Failed to connect to threads database: ${err.message}`);
  });

export const prismaClient = new PrismaClient({ adapter });

// Graceful shutdown handler
process.on('SIGINT', async () => {
  logger.info('Closing PostgreSQL connection pool...');
  await pool.end();
  await prismaClient.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  logger.info('Closing PostgreSQL connection pool...');
  await pool.end();
  await prismaClient.$disconnect();
  process.exit(0);
});