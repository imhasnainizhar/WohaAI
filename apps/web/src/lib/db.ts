import { createMongoConnection } from "@wohaai/db";
import { env } from "@wohaai/env-ts";

export const connectUsersDB = () =>
    createMongoConnection(env.USERS_MONGO_URI);