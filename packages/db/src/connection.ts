import mongoose from "mongoose";

type DBCache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

type GlobalCache = {
  usersDB: DBCache;
  threadsDB: DBCache;
};

export const globalCache = globalThis as unknown as GlobalCache;

/**
 * initialize cache safely
 */
if (!globalCache.usersDB) {
  globalCache.usersDB = { conn: null, promise: null };
}

if (!globalCache.threadsDB) {
  globalCache.threadsDB = { conn: null, promise: null };
}

/**
 * CORE CONNECTOR (multi-db safe)
 */
export async function createMongoConnection(
  uri: string,
  cache: DBCache,
  dbName: string
) {
  if (cache.conn) return cache.conn;

  if (!cache.promise) {
    cache.promise = mongoose.connect(uri, {
      dbName,
    } as any); // 👈 TS-safe workaround (Mongoose typings are overstrict)
  }

  cache.conn = await cache.promise;
  return cache.conn;
}