import { envConfigs, EXPIRATION } from "@packages/config";
import { InternalServerError, ServiceError, SessionExpiredError } from "@packages/errors";
import { logger } from "@packages/observability";
import {redisClient, redisHelpers} from '@packages/redis';

export async function createSignupSession(sessionData: {
  userID: string
  signupSessionID: string
}) {
  return await redisClient.redis.set(
      `session:${sessionData.signupSessionID}`,
      sessionData.userID
  )
}

// Signup Session
export async function getSignupSession<T>(
  signupSessionID: string,
): Promise<T> {
  logger.debug(
    "Retrieving signup session from Redis...",
  );

  const key =
    `${envConfigs.ACTIVE_SIGNUP_SESSION_CACHE_KEY}:${signupSessionID}`;

  const session =
    await redisHelpers.getCache(key);

  if (!session) {
    logger.debug({
      message:
        "Signup session expired",
        signupSessionID,
    });

    throw new SessionExpiredError();
  }

  try {
    return JSON.parse(session) as T;
  } catch (err) {
    logger.error({
      message:
        "Invalid session JSON in Redis",
        signupSessionID,
      error:
        (err as Error).message,
    });

    throw new InternalServerError(
      err,
    );
  }
}


// Signup Session
export async function getSigninSession<T>(
  signinSessionID: string,
): Promise<T> {
  logger.debug(
    "Retrieving signin session from Redis...",
  );

  const key =
    `${envConfigs.ACTIVE_SIGNIN_SESSION_CACHE_KEY}:${signinSessionID}`;

  const session =
    await redisHelpers.getCache(key);

  if (!session) {
    logger.debug({
      message:
        "SignIN session expired",
        signinSessionID,
    });

    throw new SessionExpiredError();
  }

  try {
    return JSON.parse(session) as T;
  } catch (err) {
    logger.error({
      message:
        "Invalid session JSON in Redis",
        signinSessionID,
      error:
        (err as Error).message,
    });

    throw new InternalServerError(
      err,
    );
  }
}