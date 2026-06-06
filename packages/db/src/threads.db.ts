import { createMongoConnection, globalCache } from "./connection";
import { env } from "./config/env";

export async function connectThreadsDB() {
  const uri = env.THREADS_MONGO_URI!;
  const dbName = env.THREADS_MONGO_DB_DATABASE!;

  return createMongoConnection(uri, globalCache.threadsDB, dbName);
}