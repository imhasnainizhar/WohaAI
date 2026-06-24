import { InternalServerError, SessionExpiredError } from "@wohaai/errors";
import { authLogger } from "@wohaai/telemetry";
import { RedisClient } from '@wohaai/redis';
import { redisKeys } from "@wohaai/redis";
import exp from "../../../../../packages/config/exp.json";
import { env } from "@wohaai/env-ts";


export interface AuthCacheData {
  username?: string;
  email?: string;
  emailVerified?: boolean;
  hashedPassword?: string;
}


const redisClient = new RedisClient(env.AUTH_SESSION_REDIS_URI)

export interface VerificationCodeCacheParams {
  sessionID: string
  verificationCode: string
}

export async function setVerificationCodeCache({
  sessionID,
  verificationCode
}: VerificationCodeCacheParams): Promise<"OK"> {
  return await redisClient.setCache(
    redisKeys.verificationCode(sessionID),
    JSON.stringify({ verificationCode })
  )
}

// TODO: change promise type with VerificationCode Type
export async function getVerificationCodeCache(
  sessionID: string
): Promise<{ verificationCode: string }> {
  return JSON.parse(await redisClient.getCache(
    redisKeys.verificationCode(sessionID)
  ))
}

export async function deleteVerificationCodeCache(
  id: string
): Promise<void> {
  return await redisClient.deleteCache(
    redisKeys.verificationCode(id)
  );
}

// Auth session
export async function setAuthSession(
  authSessionID: string,
  data: AuthCacheData
): Promise<"OK"> {
  authLogger.debug("Auth session set")
  return await redisClient.setCache(
    redisKeys.authSession(authSessionID),
    JSON.stringify(data),
    exp.REDIS_AUTH_SESSION_TTL
  )
}

// Auth Session
export async function getAuthSession(
  authSessionID: string,
): Promise<AuthCacheData> {

  const key =
    redisKeys.authSession(authSessionID);

  const rawSession =
    await redisClient.getCache(key);

  if (!rawSession) {
    authLogger.debug({
      message:
        "Auth session expired",
      authSessionID,
    });

    throw new SessionExpiredError();
  }

  try {
    return JSON.parse(rawSession) as AuthCacheData;
  } catch (err) {
    authLogger.error({
      message:
        "Invalid session JSON in Redis",
      authSessionID,
      error:
        (err as Error).message,
    });

    throw new InternalServerError(
      err,
    );
  }
}

// Delete auth session cache while finalizing user creation
export async function deleteAuthSession(
  authSessionID: string,
): Promise<void> {
  authLogger.debug(
    "Deleting auth session from Redis...",
  );

  const key =
    redisKeys.authSession(authSessionID);

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
    redisKeys.changePasswordSession(sessionID),
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
    redisKeys.changePasswordSession(sessionID),
  ));
}

export async function deleteChangePasswordSessionCache(
  sessionID: string
) {

  await redisClient.deleteCache(
    redisKeys.changePasswordSession(sessionID),
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
    redisKeys.changeEmailSession(sessionID),
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
    redisKeys.changeEmailSession(sessionID),
  ));
}

export async function deleteChangeEmailSessionCache(
  sessionID: string
) {

  await redisClient.deleteCache(
    redisKeys.changeEmailSession(sessionID),
  );
}