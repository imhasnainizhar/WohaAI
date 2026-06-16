import { createMongoConnection, globalCache } from "./connection";

export async function connectThreadsDB(threadsMongoURI: string) {
  const uri = threadsMongoURI;
  const dbName = "threads";

  return createMongoConnection(uri, globalCache.threadsDB, dbName);
}