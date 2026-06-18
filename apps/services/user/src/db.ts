import { createDBConnection } from "@wohaai/db";

export async function connectUsersDB(usersMongoURI: string) {
  const uri = usersMongoURI;

  return createDBConnection(uri);
}