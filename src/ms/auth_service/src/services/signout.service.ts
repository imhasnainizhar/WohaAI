import { prisma } from "@utils/prisma_client";
import { logger } from "@utils/logger";
import { ServiceResponse } from "@utils/service_response";
import { ServiceException } from "@errors/service_exception";

/**
 * @service signoutService
 * Handles token revocation & DB logic for signout.
 * - Checks if user exists
 * - Revokes all non-revoked refresh tokens
 * - Returns structured ServiceResponse
 */
export const signoutService = async <T>(userID: string) => {
  try {
    // Check if user exists
    const userExists = await prisma.user.findUnique({
      where: { userID },
      select: { userID: true },
    });

    if (!userExists) {
      logger.warn({ message: "🔴 [SIGNOUT] User not found", userID });
      throw new ServiceException(
        ServiceResponse.error({
          success: false,
          statusCode: 404,
          message: "User not found.",
          errorType: "user_not_found",
        })
      );
    }

    // Revoke all active refresh tokens
    const result = await prisma.refreshToken.updateMany({
      where: { userId: userID, revoked: false },
      data: { revoked: true, revokedAt: new Date() },
    });

    logger.info({
      message: "♻️ [SIGNOUT] Refresh tokens revoked successfully",
      userID,
      revokedCount: result.count,
    });

    // Return success response
    return ServiceResponse.success<T>({
      success: true,
      statusCode: 200,
      message: "User signed out successfully.",
      data: { revokedCount: result.count } as T,
    });
  } catch (err: any) {
    logger.error({
      message: "❌ [SIGNOUT] Error revoking tokens",
      userID,
      error: err?.message || err,
    });

    // Normalize all other errors
    if (err instanceof ServiceException) throw err;

    throw new ServiceException(
      ServiceResponse.error({
        success: false,
        statusCode: 500,
        message: err?.message || "Internal server error",
        errorType: "internal_server_error",
      })
    );
  }
};
