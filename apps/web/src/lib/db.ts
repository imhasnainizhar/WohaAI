import { createDBConnection } from "@wohaai/db";
import { env } from "@wohaai/env-ts";

export const connectUsersDB = () =>
    createDBConnection(env.USERS_MONGO_URI);