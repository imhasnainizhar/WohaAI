"use server";
import { createDBConnection } from "@wohaai/db";
import { env } from "@wohaai/env-ts";

export const connectUsersDB =
 async () => await createDBConnection(env.USERS_MONGO_URI);