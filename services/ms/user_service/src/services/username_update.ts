import { UsernameUpdate } from "@domain/types/update/username_update";
import { prisma } from "@utils/prisma";
import { logger } from "@utils/logger";
import { ServiceResponse } from "@utils/response";
import { ServiceException } from "@utils/response";

/**
 * @service usernameUpdateService
 * Handles updating a user's username.
 * - Validates input
 * - Updates DB
 * - Returns standardized ServiceResponse
 */
export const usernameUpdateService = async ({ userID, username }: UsernameUpdate) => {
  try {
    const updatedUser = await prisma.user.update({
      where: { userID: userID },
      data: { username },
      select: { userID: true, username: true },
    });

    return ServiceResponse.success({
      success: true,
      statusCode: 200,
      message: "Username updated successfully",
      data: updatedUser,
    });
  } catch (error: any) {
    if (error?.code === "P2025") {
      throw new ServiceException(
        ServiceResponse.error({
          success: false,
          statusCode: 404,
          message: "User not found",
          errorType: "not_found",
        }))
    }

    if (error?.code === "P2002") {
      throw new ServiceException(
        ServiceResponse.error({
          success: false,
          statusCode: 409,
          message: "Username already taken",
          errorType: "conflict",
        }))
    }

    logger.error({ error }, "❌ Unexpected error while updating username");
    throw new ServiceException(
      ServiceResponse.error({
        success: false,
        statusCode: 500,
        message: "Internal server error",
        errorType: "internal_server_error",
      }))
  }
};
