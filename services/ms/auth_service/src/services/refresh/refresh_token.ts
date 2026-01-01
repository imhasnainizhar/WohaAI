import { RefreshTokenDTO } from '@packages/shared/auth/refresh/dto';
import jwt, { JwtPayload, SignOptions } from "jsonwebtoken";
import argon2 from "argon2";
import { prisma } from "@clients/prisma";
import { logger } from "@utils/logger";
import { env, EXPIRATION } from "@config/env";
import { ServiceResponse, ServiceException } from "@utils/response";
import {
  ActiveSessionRecord,
  ActiveSessionSelect
} from "../../internals/types/session";
import { throwSessionExpired } from '@errors/auth';
import { AccessTokenPayload, RefreshTokenPayload } from '@packages/shared/common/auth/jwt/types';


/**
 * @description This is handler service to refresh access token
 * This service does not need zod validator as dto depends on http-only cookies and req headers.
 * @param dto : RefreshTokenDTO
 */
export async function refreshTokenService<T>({ cookies, userIPAddress }: RefreshTokenDTO) {
  try {
    const { JWT_REFRESH_SECRET_KEY, JWT_ACCESS_SECRET_KEY } = env;

    if (!JWT_REFRESH_SECRET_KEY || !JWT_ACCESS_SECRET_KEY) {
      throw new ServiceException(
        ServiceResponse.error({
          success: false,
          statusCode: 500,
          message: "Server misconfiguration: JWT keys missing.",
          errorType: "token_error",
        })
      );
    }

    //  Verify token
    let payload: (JwtPayload & { userSessionID?: string }) | null = null;
    const refreshToken = cookies[env.REFRESH_TOKEN_NAME];

    if (!refreshToken) throwSessionExpired();

    try {
      const decoded = jwt.verify(
        refreshToken,
        JWT_REFRESH_SECRET_KEY
      );
      payload = typeof decoded === "string" ? null : decoded;
    } catch (e: any) {
      if (e.name === "TokenExpiredError") throwSessionExpired();

      throw new ServiceException(
        ServiceResponse.error({
          success: false,
          statusCode: 401,
          message: "Invalid refresh token.",
          errorType: "invalid_token",
        })
      );
    }

    // Checking payload
    if (!payload?.sub || !payload?.userSessionID) return throwSessionExpired();

    // Fetch Session
    let activeSessionsRecord: ActiveSessionRecord | null = null;

    try {
      activeSessionsRecord = await prisma.userSession.findFirst({
        where: {
          userID: payload.sub,
          revoked: false,
          userSessionID: payload.userSessionID
        },
        select: ActiveSessionSelect,
      });
    } catch (e: any) {
      logger.error("DB query failed during refresh", e);
      throw new ServiceException(
        ServiceResponse.error({
          success: false,
          statusCode: 500,
          message: "Database query failed.",
          errorType: "database_error",
        })
      );
    }

    // Checking session
    if (!activeSessionsRecord?.refreshTokenHash || !activeSessionsRecord.user) {
      logger.warn("Refresh token session not found or invalid");
      throw new ServiceException(
        ServiceResponse.error({
          success: false,
          statusCode: 404,
          message: "Session not found or token invalid.",
          errorType: "user_not_found",
        })
      );
    }

    // Verify hash
    let isValid = false;
    try {
      isValid = await argon2.verify(
        activeSessionsRecord.refreshTokenHash,
        refreshToken
      );
    } catch (e: any) {
      logger.error("Argon2 verification failed", e);
      throw new ServiceException(
        ServiceResponse.error({
          success: false,
          statusCode: 500,
          message: "Token verification failed.",
          errorType: "hash_error",
        })
      );
    }

    if (!isValid) {
      await prisma.userSession.update({
        where: { userSessionID: payload.userSessionID },
        data: { revoked: true, revokedAt: new Date() }
      });

      throwSessionExpired();
    }

    // Get user through record
    const user = activeSessionsRecord.user;

    const refreshTokenPayload: RefreshTokenPayload = {
      sub: user.userID,
      jti: crypto.randomUUID(),
      userID: user.userID,
      userSessionID: payload.userSessionID,
      emailVerified: true,
      email: user.email,
      username: user.username,
    };

    // Prepare access token payload
    const accessPayload: AccessTokenPayload = {
      sub: user.userID,
      jti: crypto.randomUUID(),
      userID: user.userID,
      userSessionID: payload.userSessionID,
      emailVerified: true,
      email: user.email,
      username: user.username,
      role: "user",
    };

    // Issue tokens(Refresh and access, refresh token just for new expiry)
    const newAccessToken = jwt.sign(
      accessPayload,
      JWT_ACCESS_SECRET_KEY,
      { expiresIn: EXPIRATION.JWT_ACCESS_SESSION_TOKEN } as SignOptions
    );

    const newRefreshToken = jwt.sign(
      refreshTokenPayload,
      JWT_REFRESH_SECRET_KEY,
      { expiresIn: EXPIRATION.JWT_REFRESH_SESSION_TOKEN } as SignOptions
    );

    // Creating new hash
    const newRefreshTokenHash = await argon2.hash(newRefreshToken);

    // Rotating refresh token hash
    await prisma.userSession.update({
      where: { userSessionID: payload.userSessionID },
      data: {
        refreshTokenHash: newRefreshTokenHash,
        revokedAt: null,
        userIPAddress: userIPAddress
      },
    });

    logger.debug(`Tokens rotated successfully for userID: ${user.userID}`);

    return ServiceResponse.success<T>({
      success: true,
      statusCode: 200,
      message: "Tokens refreshed successfully.",
      data: {
        newAccessToken,
        newRefreshToken,
        user,
      } as T,
    });

  } catch (err: any) {
    if (err instanceof ServiceException) throw err;

    logger.error("Unhandled refresh token error" + {
      message: err?.message,
      stack: err?.stack,
    });

    throw new ServiceException(
      ServiceResponse.error({
        success: false,
        statusCode: 500,
        message: "Internal server error",
        errorType: "internal_server_error",
      })
    );
  }
}
