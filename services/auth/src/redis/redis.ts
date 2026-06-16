import { VerificationCode } from "@packages/contracts/auth";
import { InternalServerError, SessionExpiredError } from "@packages/errors";
import { authLogger } from "@packages/observability";
import { RedisClient } from '@packages/redis';
import redisKeys from "../../../../packages/config/redis-keys.json";
import exp from "../../../../packages/config/exp.json";
import { env } from "@packages/env-ts";


export interface SignupCacheData {
  hashedPassword?: string;
}

export const RedisKeys = {
  authSession: (sessionID: string) =>
    `${redisKeys.AUTH_SESSION_REDIS_KEY_PREFIX}:${sessionID}`,

  verificationCode: (email: string) =>
    `${redisKeys.VERIFICATION_CODE_REDIS_KEY_PREFIX}:${email}`,

  confirmedEmail: (sessionID: string) =>
    `${redisKeys.CONFIRMED_EMAIL_REDIS_KEY_PREFIX}:${sessionID}`,

  changeEmailSession: (sessionID: string) =>
    `${redisKeys.CHANGE_EMAIL_SESSION_REDIS_KEY_PREFIX}:${sessionID}`,

  changePasswordSession: (sessionID: string) =>
    `${redisKeys.CHANGE_PASSWORD_SESSION_REDIS_KEY_PREFIX}:${sessionID}`,
} as const;

const redisClient = new RedisClient(env.AUTH_SESSION_REDIS_URI)


export async function setSignupSession(
  signupSessionID: string,
  data: SignupCacheData
): Promise<"OK"> {
  return await redisClient.setCache(
    RedisKeys.authSession(signupSessionID),
    JSON.stringify(data),
    exp.REDIS_AUTH_SESSION_TTL
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
    RedisKeys.verificationCode(id),
    verificationCode
  )
}

export async function getVerificationCodeCache(
  id: string
): Promise<VerificationCode> {
  return JSON.parse(await redisClient.getCache(
    RedisKeys.verificationCode(id)
  ))
}

export async function deleteVerificationCodeCache(
  id: string
): Promise<void> {
  return await redisClient.deleteCache(
    RedisKeys.verificationCode(id)
  );
}

// Signup Session
export async function getSignupSession(
  signupSessionID: string,
): Promise<SignupCacheData> {

  const key =
    RedisKeys.authSession(signupSessionID);

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
    return JSON.parse(rawSession) as SignupCacheData;
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
    RedisKeys.authSession(signupSessionID);

  return await redisClient.deleteCache(key);
}

// ============================= //
// Change Password Cache
// ============================= //

export interface ChangePasswordSessionParams {
  sessionID: string;
  userID: string;
  username: string;
  email: string;
  createdOn: Date;
}

export async function setChangePasswordSessionCache(
  { userID, sessionID, username, email, createdOn }: ChangePasswordSessionParams
): Promise<"OK"> {

  return await redisClient.setCache(
    RedisKeys.changePasswordSession(sessionID),
    JSON.stringify({
      userID,
      username,
      email,
      createdOn
    }),
    exp.REDIS_AUTH_SESSION_TTL,
  );
}

export interface ChangePasswordSessionCache {
  userID: string;
  username: string;
  createdOn: Date;
}

export async function getChangePasswordSessionCache(
  sessionID: string
): Promise<ChangePasswordSessionCache> {
  return JSON.parse(await redisClient.getCache(
    RedisKeys.changePasswordSession(sessionID),
  ));
}

export async function deleteChangePasswordSessionCache(
  sessionID: string
) {

  await redisClient.deleteCache(
    RedisKeys.changePasswordSession(sessionID),
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
    RedisKeys.changeEmailSession(sessionID),
    JSON.stringify({
      userID,
      newEmail,
      createdOn
    }),
    exp.REDIS_AUTH_SESSION_TTL,
  );
}

export async function getChangeEmailSessionCache(
  sessionID: string
): Promise<ChangeEmailSessionCache> {
  return JSON.parse(await redisClient.getCache(
    RedisKeys.changeEmailSession(sessionID),
  ));
}

export async function deleteChangeEmailSessionCache(
  sessionID: string
) {

  await redisClient.deleteCache(
    RedisKeys.changeEmailSession(sessionID),
  );
}