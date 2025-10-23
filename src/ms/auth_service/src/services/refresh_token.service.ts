import jwt, { JwtPayload, SignOptions } from "jsonwebtoken";
import argon2 from "argon2";
import { prisma } from "@utils/prisma_client";
import { logger } from "@utils/logger";
import { env, EXPIRATION } from "@config/env.config";
import { ServiceResponse, ServiceException } from "@utils/response";
import { UserSessionRefresh, ActiveSessionRecord, activeSessionSelect } from "@custom_types/user_session.types";

export async function refreshTokenService<T>(
  data: UserSessionRefresh
) {
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

    // Verify refresh token signature
    const decoded = jwt.verify(data.refreshSessionToken, JWT_REFRESH_SECRET_KEY);
    const payload = typeof decoded === "string" ? null : decoded as JwtPayload & { userSessionID?: string };

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

    // Fetch latest refresh token record and its user
    const activeSessionsRecord : ActiveSessionRecord | null = await prisma.userSession.findFirst({
      where: { userID: payload.sub, revoked: false, userSessionID: payload.userSessionID },
      select: activeSessionSelect,
    });

    if (!activeSessionsRecord || !activeSessionsRecord.refreshTokenHash || !activeSessionsRecord.user) {
      logger.warn("🔒 [REFRESH] User not found or refresh token hash missing");
      throw new ServiceException(
        ServiceResponse.error({
          success: false,
          statusCode: 404,
          message: "User not found or refresh token invalid.",
          errorType: "user_not_found",
        })
      );
    }

    // Verify token matches stored hash
    const isValid = await argon2.verify(activeSessionsRecord.refreshTokenHash, data.refreshSessionToken);
    if (!isValid) {
      await prisma.userSession.update({
        where: { userSessionID: payload.userSessionID },
        data: { revoked: true, revokedAt: new Date() }
      });
      logger.warn(`🔒 [REFRESH] Refresh token hash mismatch for userID: ${activeSessionsRecord.user.userID}`);
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

    // Generate new access + refresh tokens
    const newAccessToken = jwt.sign(
      { sub: user.userID, email: user.email, name: `${user.userFirstName} ${user.userLastName}` },
      JWT_ACCESS_SECRET_KEY,
      { expiresIn: EXPIRATION.JWT_ACCESS_SESSION_TOKEN } as SignOptions
    );

    const newRefreshToken = jwt.sign(
      { sub: user.userID, userSessionID: data.userSessionID },
      JWT_REFRESH_SECRET_KEY,
      activeSessionsRecord.rememberMe ? { expiresIn: EXPIRATION.JWT_REFRESH_SESSION_TOKEN } as SignOptions : { expiresIn: EXPIRATION.JWT_REFRESH_REMEMBER_OFF_SESSION_TOKEN } as SignOptions
    );

    // Hash and store the new refresh token
    const newRefreshTokenHash = await argon2.hash(newRefreshToken);

    await prisma.userSession.update({
      where: {
        userSessionID: data.userSessionID,
      },
      data: {
        refreshTokenHash: newRefreshTokenHash,
        revokedAt: null,
        userIPAddress: data.userIPAddress
      },
    });

    logger.debug(`♻️ [REFRESH] Tokens rotated successfully for userID: ${user.userID}`);

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

    logger.error(`❌ [REFRESH] Unexpected error: ${err}`);
    throw new ServiceException(
      ServiceResponse.error({
        success: false,
        statusCode: 500,
        message: err?.message || "Internal server error",
        errorType: "internal_server_error",
      })
    );
  }
}
