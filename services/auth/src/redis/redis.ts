import { env } from "@/config/env";
import { exp } from "@/config/exp";
import { Email, VerificationCode } from "@packages/contracts/auth";
import { InternalServerError, ServiceError, SessionExpiredError } from "@packages/errors";
import { authLogger } from "@packages/observability";
import { RedisClient } from '@packages/redis';


export interface SignupSessionData {
  profilePicURI?: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  hashedPassword?: string;
}

const redisClient = new RedisClient(env.AUTH_SESSION_STORE_URI)


export async function setSignupSession(
  signupSessionID: string,
  data: SignupSessionData
): Promise<"OK"> {
  return await redisClient.setCache(
    `${env.SIGNUP_SESSION_REDIS_KEY_PREFIX}:${signupSessionID}`,
    JSON.stringify(data),
    exp.REDIS_SIGNUP_SESSION_TTL
  )
}

export interface VerificationCodeCacheParams {
  id: string
  verificationCode: string
}

export async function setVerificationCodeCache({
  id,
  verificationCode
}: VerificationCodeCacheParams): Promise<"OK"> {
  return await redisClient.setCache(
    `${env.VERIFICATION_CODE_REDIS_KEY_PREFIX}:${id}`,
    verificationCode
  )
}

export async function getVerificationCodeCache(
  id: string
): Promise<VerificationCode> {
  return JSON.parse(await redisClient.getCache(
    `${env.VERIFICATION_CODE_REDIS_KEY_PREFIX}:${id}`
  ))
}

export async function deleteVerificationCodeCache(
  id: string
): Promise<void> {
    return await redisClient.deleteCache(
      `${env.VERIFICATION_CODE_REDIS_KEY_PREFIX}:${id}`
    );
}

// Signup Session
export async function getSignupSession(
  signupSessionID: string,
): Promise<SignupSessionData> {

  const key =
    `${env.SIGNUP_SESSION_REDIS_KEY_PREFIX}:${signupSessionID}`;

  const rawSession =
    await redisClient.getCache(key);

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

  return await redisClient.deleteCache(key);
}

export async function setConfirmedEmailCache({
  signupSessionID,
  email,
}: {
  signupSessionID: string;
  email: string;
}): Promise<void> {
  await redisClient.setCache(
    `${env.CONFIRMED_EMAIL_REDIS_KEY_PREFIX}:${signupSessionID}`,
    email,
    exp.REDIS_SIGNUP_SESSION_TTL_EXTENDED
  );
}

export async function getConfirmedEmailCache(
  signupSessionID: string
): Promise<Email> {
  return JSON.parse(await redisClient.getCache(
    `${env.CONFIRMED_EMAIL_REDIS_KEY_PREFIX}:${signupSessionID}`
  ));
}

export async function deleteConfirmedEmailCache(
  signupSessionID: string
): Promise<void> {
    return await redisClient.deleteCache(
      `${env.CONFIRMED_EMAIL_REDIS_KEY_PREFIX}:${signupSessionID}`
    );
}

// ============================= //
// Forget Password Cache
// ============================= //

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

  return await redisClient.setCache(
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
  return JSON.parse(await redisClient.getCache(
    `${env.FORGOT_PASSWORD_SESSION_REDIS_KEY_PREFIX}:${sessionID}`,
  ));
}

export async function deleteForgotPasswordSessionCache(
  sessionID: string
) {

  await redisClient.deleteCache(
    `${env.FORGOT_PASSWORD_SESSION_REDIS_KEY_PREFIX}:${sessionID}`,
  );
}

// ============================= //
// Change Email Cache
// ============================= //

export interface ChangeEmailSessionParams {
  sessionID: string;
  userID: string;
  newEmail: string;
  createdOn: Date;
}

export interface ChangeEmailSessionCache {
  userID: string;
  newEmail: string;
  createdOn: Date;
}

export async function setChangeEmailSessionCache(
  { userID, sessionID, newEmail, createdOn }: ChangeEmailSessionParams
): Promise<"OK"> {

  return await redisClient.setCache(
    `${env.CHANGE_EMAIL_SESSION_REDIS_KEY_PREFIX}:${sessionID}`,
    JSON.stringify({
      userID,
      newEmail,
      createdOn
    }),
    exp.REDIS_FORGOT_PASSWORD_SESSION_TTL,
  );
}

export async function getChangeEmailSessionCache(
  sessionID: string
): Promise<ChangeEmailSessionCache> {
  return JSON.parse(await redisClient.getCache(
    `${env.FORGOT_PASSWORD_SESSION_REDIS_KEY_PREFIX}:${sessionID}`,
  ));
}

export async function deleteChangeEmailSessionCache(
  sessionID: string
) {

  await redisClient.deleteCache(
    `${env.FORGOT_PASSWORD_SESSION_REDIS_KEY_PREFIX}:${sessionID}`,
  );
}