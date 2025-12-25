import jwt, { JwtPayload, SignOptions } from "jsonwebtoken";
import argon2 from "argon2";
import { prisma } from "@utils/prisma_client";
import { logger } from "@utils/logger";
import { env, EXPIRATION } from "@config/env";
import { ServiceResponse, ServiceException } from "@utils/response";
import {
  UserSessionRefresh,
  ActiveSessionRecord,
  activeSessionSelect
} from "../domain/types/session";

export async function refreshTokenService<T>(data: UserSessionRefresh) {
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

    // ---------- VERIFY TOKEN ----------
    let payload: (JwtPayload & { userSessionID?: string }) | null = null;

    try {
      const decoded = jwt.verify(
        data.refreshSessionToken,
        JWT_REFRESH_SECRET_KEY
      );
      payload = typeof decoded === "string" ? null : decoded;
    } catch (e: any) {
      if (e.name === "TokenExpiredError") {
        throw new ServiceException(
          ServiceResponse.error({
            success: false,
            statusCode: 401,
            message: "Refresh token expired.",
            errorType: "token_expired",
          })
        );
      }

      throw new ServiceException(
        ServiceResponse.error({
          success: false,
          statusCode: 401,
          message: "Invalid refresh token.",
          errorType: "invalid_token",
        })
      );
    }

    if (!payload?.sub || !payload?.userSessionID) {
      throw new ServiceException(
        ServiceResponse.error({
          success: false,
          statusCode: 401,
          message: "Invalid refresh token payload.",
          errorType: "invalid_token",
        })
      );
    }

    // ---------- FETCH SESSION ----------
    let activeSessionsRecord: ActiveSessionRecord | null = null;

    try {
      activeSessionsRecord = await prisma.userSession.findFirst({
        where: {
          userID: payload.sub,
          revoked: false,
          userSessionID: payload.userSessionID
        },
        select: activeSessionSelect,
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

    // ---------- VERIFY HASH ----------
    let isValid = false;
    try {
      isValid = await argon2.verify(
        activeSessionsRecord.refreshTokenHash,
        data.refreshSessionToken
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

      throw new ServiceException(
        ServiceResponse.error({
          success: false,
          statusCode: 401,
          message: "Session expired, require signin.",
          errorType: "session_expired",
        })
      );
    }

    const user = activeSessionsRecord.user;

    // ---------- ISSUE TOKENS ----------
    const newAccessToken = jwt.sign(
      {
        sub: user.userID,
        email: user.email,
        name: `${user.userFirstName} ${user.userLastName}`
      },
      JWT_ACCESS_SECRET_KEY,
      { expiresIn: EXPIRATION.JWT_ACCESS_SESSION_TOKEN } as SignOptions
    );

    const newRefreshToken = jwt.sign(
      { sub: user.userID, userSessionID: payload.userSessionID },
      JWT_REFRESH_SECRET_KEY,
      { expiresIn: EXPIRATION.JWT_REFRESH_SESSION_TOKEN } as SignOptions
    );

    const newRefreshTokenHash = await argon2.hash(newRefreshToken);

    await prisma.userSession.update({
      where: { userSessionID: payload.userSessionID },
      data: {
        refreshTokenHash: newRefreshTokenHash,
        revokedAt: null,
        userIPAddress: data.userIPAddress
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
