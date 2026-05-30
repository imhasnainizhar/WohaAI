import { env } from "@/config/env";
import { exp } from "@/config/exp";
import { Email, VerificationCode } from "@packages/contracts/auth";
import { InternalServerError, ServiceError, SessionExpiredError } from "@packages/errors";
import { authLogger } from "@packages/observability";
import { redisHelpers } from '@packages/redis';


export interface SignupSessionData {
  profilePicURI?: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  hashedPassword?: string;
}


export async function setSignupSession(
  signupSessionID: string,
  data: SignupSessionData
): Promise<"OK"> {
  return await redisHelpers.setCache(
    `${env.SIGNUP_SESSION_REDIS_KEY_PREFIX}:${signupSessionID}`,
    JSON.stringify(data),
    exp.REDIS_SIGNUP_SESSION_TTL
  )
}

export interface VerificationCodeCacheParams {
  signupSessionID: string
  verificationCode: string
}

export async function setVerificationCodeCache({
  signupSessionID,
  verificationCode
}: VerificationCodeCacheParams): Promise<"OK"> {
  return await redisHelpers.setCache(
    `${env.VERIFICATION_CODE_REDIS_KEY_PREFIX}:${signupSessionID}`,
    verificationCode
  )
}

export async function getVerificationCodeCache(
  signupSessionID: string
): Promise<VerificationCode> {
  return JSON.parse(await redisHelpers.getCache(
    `${env.VERIFICATION_CODE_REDIS_KEY_PREFIX}:${signupSessionID}`
  ))
}

export async function deleteVerificationCodeCache(
  signupSessionID: string
): Promise<void> {
    return await redisHelpers.deleteCache(
      `${env.VERIFICATION_CODE_REDIS_KEY_PREFIX}:${signupSessionID}`
    );
}

// Signup Session
export async function getSignupSession(
  signupSessionID: string,
): Promise<SignupSessionData> {

  const key =
    `${env.SIGNUP_SESSION_REDIS_KEY_PREFIX}:${signupSessionID}`;

  const rawSession =
    await redisHelpers.getCache(key);

  if (!rawSession) {
    authLogger.debug({
      message:
        "Signup session expired",
      signupSessionID,
    });

    throw new SessionExpiredError();
  }

  try {
    return JSON.parse(rawSession) as SignupSessionData;
  } catch (err) {
    authLogger.error({
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
  authLogger.debug(
    "Deleting signup session from Redis...",
  );

  const key =
    `${env.SIGNUP_SESSION_REDIS_KEY_PREFIX}:${signupSessionID}`;

  return await redisHelpers.deleteCache(key);
}

export async function setConfirmedEmailCache({
  signupSessionID,
  email,
}: {
  signupSessionID: string;
  email: string;
}): Promise<void> {
  await redisHelpers.setCache(
    `${env.CONFIRMED_EMAIL_REDIS_KEY_PREFIX}:${signupSessionID}`,
    email,
    exp.REDIS_SIGNUP_SESSION_TTL_EXTENDED
  );
}

export async function getConfirmedEmailCache(
  signupSessionID: string
): Promise<Email> {
  return JSON.parse(await redisHelpers.getCache(
    `${env.CONFIRMED_EMAIL_REDIS_KEY_PREFIX}:${signupSessionID}`
  ));
}

export async function deleteConfirmedEmailCache(
  signupSessionID: string
): Promise<void> {
    return await redisHelpers.deleteCache(
      `${env.CONFIRMED_EMAIL_REDIS_KEY_PREFIX}:${signupSessionID}`
    );
}

export interface ForgotPasswordSessionParams {
  sessionID: string;
  userID: string;
  username: string;
  email: string;
  createdOn: Date;
}

export async function setForgotPasswordSessionCache(
  { userID, sessionID, username, email, createdOn }: ForgotPasswordSessionParams
): Promise<"OK"> {

  return await redisHelpers.setCache(
    `${env.FORGOT_PASSWORD_SESSION_REDIS_KEY_PREFIX}:${sessionID}`,
    JSON.stringify({
      userID,
      username,
      email,
      createdOn
    }),
    exp.REDIS_FORGOT_PASSWORD_SESSION_TTL,
  );
}

export interface ForgotPasswordSessionCache {
  userID: string;
  username: string;
  createdOn: Date;
}

export async function getForgotPasswordSessionCache(
  sessionID: string
): Promise<ForgotPasswordSessionCache> {
  return JSON.parse(await redisHelpers.getCache(
    `${env.FORGOT_PASSWORD_SESSION_REDIS_KEY_PREFIX}:${sessionID}`,
  ));
}

export async function deleteForgotPasswordSessionCache(
  sessionID: string
) {

  await redisHelpers.deleteCache(
    `${env.FORGOT_PASSWORD_SESSION_REDIS_KEY_PREFIX}:${sessionID}`,
  );
}