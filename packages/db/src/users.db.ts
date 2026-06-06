import { env } from "./config/env";
import { createMongoConnection, globalCache } from "./connection";

export async function connectUsersDB() {
  const uri = env.USERS_MONGO_URI!;
  const dbName = env.USERS_MONGO_DB_DATABASE!;

  return createMongoConnection(uri, globalCache.usersDB, dbName);
}