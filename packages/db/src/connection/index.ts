import mongoose from "mongoose";

type DBCache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

// Internal cache managed by createMongoConnection
const connectionCache = new Map<string, DBCache>();

/**
 * CORE CONNECTOR (multi-db safe with internal cache)
 */
export async function createMongoConnection(
  uri: string,
  dbName: string
) {
  const cacheKey = `${uri}:${dbName}`;

  // Return existing connection if available
  let cache = connectionCache.get(cacheKey);
  if (cache?.conn) return cache.conn;

  // Initialize cache for this connection if not exists
  if (!cache) {
    cache = { conn: null, promise: null };
    connectionCache.set(cacheKey, cache);
  }

  // Create connection promise if not exists
  if (!cache.promise) {
    cache.promise = mongoose.connect(uri, {
      dbName,
    } as any); // 👈 TS-safe workaround (Mongoose typings are overstrict)
  }

  cache.conn = await cache.promise;
  return cache.conn;
}