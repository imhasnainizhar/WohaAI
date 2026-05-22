import { prisma } from "@utils/prisma";
import { logger } from "@utils/logger";
import { ServiceResponse } from "@utils/response";
import { ServiceException } from "@utils/response";
import { EmailUpdate } from "@domain/types/update/email_update";

/**
 * @service emailUpdateService
 * Handles updating a user's email in the database.
 * Returns a ServiceResponse for both success and validation/DB errors.
 */
export const emailUpdateService = async ({ userID, email }: EmailUpdate) => {
  try {
    // Update the user's email
    const updatedUser = await prisma.user.update({
      where: { userID: userID },
      data: { email },
      select: { userID: true, email: true },
    });

    // Return success response
    return ServiceResponse.success({
      success: true,
      statusCode: 200,
      message: "Email updated successfully",
      data: updatedUser,
    });

  } catch (error: any) {
    // Prisma record not found
    if (error.code === "P2025") {
      throw new ServiceException(
        ServiceResponse.error({
          success: false,
          statusCode: 404,
          message: "User not found",
          errorType: "not_found",
        }))
    }

    // Prisma unique constraint violation
    if (error.code === "P2002") {
      throw new ServiceException(
        ServiceResponse.error({
          success: false,
          statusCode: 409,
          message: "Email already in use",
          errorType: "conflict",
        }))
    }

    // Unknown / unexpected errors
    logger.error({ error }, "Unhandled error in emailUpdateService");
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
