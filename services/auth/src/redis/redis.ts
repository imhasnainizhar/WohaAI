import { env } from "@/config/env";
import { exp } from "@/config/exp";
import { InternalServerError, ServiceError, SessionExpiredError } from "@packages/errors";
import { logger } from "@packages/observability";
import { redisClient, redisHelpers } from '@packages/redis';


export interface SignupSession {
  signupSessionID: string;
  userID: string;
  profilePicURI?: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  hashedPassword?: string;
}

export async function setSignupSession(
  signupSession: SignupSession
): Promise<"OK"> {
  try {
    return await redisHelpers.setCache(
      `${env.ACTIVE_SIGNUP_SESSION_CACHE_KEY}:${signupSession.signupSessionID}`,
      JSON.stringify(signupSession.userID),
      exp.REDIS_SIGNUP_SESSION_TTL
    )
  } catch (error: unknown) {
    throw new InternalServerError(error)
  }
}

export interface VarificationCodeCacheParams {
  signupSessionID: string
  verificationCode: string
}

export async function setVerificationCodeCache({
  signupSessionID,
  verificationCode
}: VarificationCodeCacheParams): Promise<"OK"> {
  try {
    return await redisHelpers.setCache(
      `verification-code:${signupSessionID}`,
      verificationCode
    )
  } catch (error: unknown) {
    throw new InternalServerError(error)
  }
}

export async function getVerificationCodeCache(
  signupSessionID: string
): Promise<string | null> {
  try {
    return await redisHelpers.getCache(
      `verification-code:${signupSessionID}`
    );
  } catch (error: unknown) {
    throw new InternalServerError(error);
  }
}

export async function deleteVerificationCodeCache(
  signupSessionID: string
): Promise<void> {
  try {
    return await redisHelpers.deleteCache(
      `verification-code:${signupSessionID}`
    );
  } catch (error: unknown) {
    throw new InternalServerError(error);
  }
}

export async function setExtendedSignupSession(
  signupSession: SignupSession
): Promise<"OK"> {
  try {
    return await redisHelpers.setCache(
      `${env.ACTIVE_SIGNUP_SESSION_CACHE_KEY}:${signupSession.signupSessionID}`,
      JSON.stringify(signupSession.userID),
      exp.REDIS_SIGNUP_SESSION_TTL_EXTENDED
    )
  } catch (error: unknown) {
    throw new InternalServerError(error)
  }
}

// Signup Session
export async function getSignupSession(
  signupSessionID: string,
): Promise<SignupSession> {
  logger.debug(
    "Retrieving signup session from Redis...",
  );

  const key =
    `${env.ACTIVE_SIGNUP_SESSION_CACHE_KEY}:${signupSessionID}`;

  const rawSession =
    await redisHelpers.getCache(key);

  if (!rawSession) {
    logger.debug({
      message:
        "Signup session expired",
      signupSessionID,
    });

    throw new SessionExpiredError();
  }

  try {
    return JSON.parse(rawSession) as SignupSession;
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

// Delete signup session cache while finalizing user creation
export async function deleteSignupSession(
  signupSessionID: string,
): Promise<void> {
  logger.debug(
    "Deleting signup session from Redis...",
  );

  const key =
    `${env.ACTIVE_SIGNUP_SESSION_CACHE_KEY}:${signupSessionID}`;

  try {
    return await redisHelpers.deleteCache(
      key,
    );
  } catch (err) {
    logger.error({
      message:
        "Failed to delete signup session from Redis",
      signupSessionID,
      error:
        (err as Error).message,
    });

    throw new InternalServerError(
      err,
    );
  }
}

export async function setConfirmedEmailCache({
  signupSessionID,
  email,
}: {
  signupSessionID: string;
  email: string;
}): Promise<void> {
  try {
    await redisHelpers.setCache(
      `email-confirmed:${signupSessionID}`,
      email,
      exp.REDIS_SIGNUP_SESSION_TTL_EXTENDED
    );
  } catch (error: unknown) {
    throw new InternalServerError(error);
  }
}

export async function getConfirmedEmailCache(
  signupSessionID: string
): Promise<string | null> {
  try {
    return await redisHelpers.getCache(
      `email-confirmed:${signupSessionID}`
    );
  } catch (error: unknown) {
    throw new InternalServerError(error);
  }
}

export async function deleteConfirmedEmailCache(
  signupSessionID: string
): Promise<void> {
  try {
    return await redisHelpers.deleteCache(
      `email-confirmed:${signupSessionID}`
    );
  } catch (error: unknown) {
    throw new InternalServerError(error);
  }
}