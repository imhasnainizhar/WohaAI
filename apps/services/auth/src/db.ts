import { createDBConnection } from "@wohaai/db/connection";

export async function connectUsersDB(usersMongoURI: string) {
  const uri = usersMongoURI;
  const dbName = "users";

  return createDBConnection(uri, dbName);
}