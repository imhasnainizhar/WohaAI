import mongoose from "mongoose";

type DBCache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

// Internal cache managed by createDBConnection
const connectionCache = new Map<string, DBCache>();

/**
 * CORE CONNECTOR (multi-db safe with internal cache)
 */
export async function createDBConnection(
  uri: string,
) {
  const cacheKey = `${uri}`;

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
    cache.promise = mongoose.connect(uri);
  }

  cache.conn = await cache.promise;
  return cache.conn;
}