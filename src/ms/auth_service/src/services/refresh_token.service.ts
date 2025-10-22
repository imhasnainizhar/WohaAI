import jwt from "jsonwebtoken";
import argon2 from "argon2";
import { prisma } from "@utils/prisma_client";
import { logger } from "@utils/logger";
import { env } from "@config/env.config";
import { ServiceResponse, ServiceException } from "@utils/response";

/**
 * @service refreshTokenService
 * Handles business logic for refreshing tokens.
 * - Verifies refresh token
 * - Rotates access + refresh tokens
 * - Updates refresh token hash in DB
 */
export async function refreshTokenService<T>(refreshToken: string) {
  try {
    const JWT_REFRESH_SECRET_KEY = env.JWT_REFRESH_SECRET_KEY;
    const JWT_ACCESS_SECRET_KEY = env.JWT_ACCESS_SECRET_KEY;

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

    // Verify the refresh token
    let payload: any;
    try {
      payload = jwt.verify(refreshToken, JWT_REFRESH_SECRET_KEY);
    } catch (err) {
      logger.warn({ message: "🔒 [REFRESH] Invalid refresh token" });
      throw new ServiceException(
        ServiceResponse.error({
          success: false,
          statusCode: 401,
          message: "Invalid refresh token.",
          errorType: "invalid_token",
        })
      );
    }

    // Find user by ID from token payload
    const user = await prisma.user.findUnique({
      where: { userID: payload.sub },
    });

    if (!user || !user.refreshTokenHash) {
      logger.warn({ message: "🔒 [REFRESH] User not found or no refresh token hash" });
      throw new ServiceException(
        ServiceResponse.error({
          success: false,
          statusCode: 404,
          message: "User not found or refresh token invalid.",
          errorType: "user_not_found",
        })
      );
    }

    // Verify the stored hash matches the provided refresh token
    const valid = await argon2.verify(user.refreshTokenHash, refreshToken);
    if (!valid) {
      logger.warn({ message: "🔒 [REFRESH] Refresh token hash mismatch", userID: user.userID });
      throw new ServiceException(
        ServiceResponse.error({
          success: false,
          statusCode: 401,
          message: "Refresh token mismatch.",
          errorType: "token_mismatch",
        })
      );
    }

    // Rotate access + refresh tokens
    const newAccessToken = jwt.sign(
      { sub: user.userID, email: user.email, name: `${user.userFirstName} ${user.userLastName}` },
      JWT_ACCESS_SECRET_KEY,
      { expiresIn: "1h" }
    );

    const newRefreshToken = jwt.sign({ sub: user.userID }, JWT_REFRESH_SECRET_KEY, {
      expiresIn: "7d",
    });

    // Hash and store new refresh token
    const newRefreshTokenHash = await argon2.hash(newRefreshToken);
    await prisma.user.update({
      where: { userID: user.userID },
      data: { refreshTokenHash: newRefreshTokenHash },
    });

    logger.debug({ message: "♻️ [REFRESH] Tokens rotated successfully", userID: user.userID });

    // Return new tokens + user info wrapped in ServiceResponse
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
    // Pass through ServiceExceptions
    if (err instanceof ServiceException) throw err;

    logger.error({ message: "❌ [REFRESH] Unexpected error", error: err });
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
