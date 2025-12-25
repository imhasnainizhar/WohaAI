import { PasswordUpdate } from "@domain/types/update/password_update";
import { prisma } from "@utils/prisma_client";
import argon2 from "argon2";
import { logger } from "@utils/logger";
import { ServiceResponse } from "@utils/response";
import { ServiceException } from "@utils/response";

/**
 * @service passwordUpdateService
 * Handles updating user's password.
 * - Validates input using Zod
 * - Hashes new password
 * - Updates user record in DB
 * - Returns a standardized ServiceResponse
 */
export const passwordUpdateService = async ({ userID, newPassword }: PasswordUpdate) => {
  try {

    // Hash new password
    const hashedPassword = await argon2.hash(newPassword);

    // Update password in database
    const updatedUser = await prisma.user.update({
      where: { userID: userID },
      data: { hashedPassword },
      select: { userID: true, email: true },
    });

    // Return success
    return ServiceResponse.success({
      success: true,
      statusCode: 200,
      message: "Password updated successfully",
      data: updatedUser,
    });

  } catch (error: any) {
    // Prisma: record not found
    if (error?.code === "P2025") {
      throw new ServiceException(
        ServiceResponse.error({
          success: false,
          statusCode: 404,
          message: "User not found",
          errorType: "not_found",
        })
      )
    }

    // Log unexpected errors
    logger.error({ error }, "❌ Unhandled error in passwordUpdateService");

    throw new ServiceException(
      ServiceResponse.error({
        success: false,
        statusCode: 500,
        message: "Internal server error",
        errorType: "internal_server_error",
      })
    )
  }
};
