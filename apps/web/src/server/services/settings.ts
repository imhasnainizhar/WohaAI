import { connectUsersDB } from "@packages/db";
import { nextAppLogger as logger } from "@packages/observability";
import {
  findOrCreateSettings,
  patchSettings,
} from "../repo/settings";
import { env } from "@packages/env-ts";
import {
  normalizeUpdates,
} from "../validators/settings";

export async function getUserSettings(userId: string) {
  await connectUsersDB(env.USERS_MONGO_URI);

  const doc = await findOrCreateSettings(userId);

  return {
    settings: doc.values,
    updatedAt: doc.updatedAt.getTime(),
  };
}

export async function updateUserSettings(
  userId: string,
  body: unknown
) {
  try {
    logger.debug("Mongo URI:" + env.USERS_MONGO_URI);
    await connectUsersDB(env.USERS_MONGO_URI);

    const updates = normalizeUpdates(body);

    logger.debug("[updateUserSettings] Updates:" + JSON.stringify(updates));

    const doc = await patchSettings(
      userId,
      updates
    );

    return {
      settings: doc.values,
      updatedAt: doc.updatedAt.getTime(),
    };
  } catch (error) {
    console.error("[updateUserSettings] Error:", error);
    throw error;
  }
}