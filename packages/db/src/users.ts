import { createMongoConnection, globalCache } from "./connection";

export async function connectUsersDB(usersMongoURI: string) {
  const uri = usersMongoURI;
  const dbName = "users";

  return createMongoConnection(uri, globalCache.usersDB, dbName);
}