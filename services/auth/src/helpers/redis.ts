import { env, EXPIRATION } from "@packages/config";
import { InternalServerError, ServiceError, SessionExpiredError } from "@packages/errors";
import { logger } from "./logger";
import {redisHelpers} from '@packages/redis';


// Signup Session Cache
export async function getSignupCache<T>(
  signupSessionID: string,
): Promise<T> {
  logger.debug(
    "Retrieving signup session from Redis...",
  );

  const key =
    `${env.ACTIVE_SIGNUP_SESSION_CACHE_KEY}:${signupSessionID}`;

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


// Signup Session Cache
export async function getSigninCache<T>(
  signinSessionID: string,
): Promise<T> {
  logger.debug(
    "Retrieving signin session from Redis...",
  );

  const key =
    `${env.ACTIVE_SIGNIN_SESSION_CACHE_KEY}:${signinSessionID}`;

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