import { usernameUpdateSchema, UsernameUpdate } from "@schemas/username_update.schema";
import { prisma } from "@utils/prisma_client";
import { ZodError } from "zod";
import { logger } from "@utils/logger";
import { ServiceResponse } from "@utils/service_response";

/**
 * @service usernameUpdateService
 * Handles updating a user's username.
 * - Validates input
 * - Updates DB
 * - Returns standardized ServiceResponse
 */
export const usernameUpdateService = async (body: UsernameUpdate) => {
  try {
    const parsed = usernameUpdateSchema.parse(body);
    const { userID, username } = parsed;

    const updatedUser = await prisma.user.update({
      where: { id: userID },
      data: { username },
      select: { id: true, username: true },
    });

    return ServiceResponse.success({
      success: true,
      statusCode: 200,
      message: "Username updated successfully",
      data: updatedUser,
    });
  } catch (error: any) {
    if (error instanceof ZodError) {
      return ServiceResponse.error({
        success: false,
        statusCode: 400,
        message: "Validation failed",
        errorType: "validation_error",
        errors: error.flatten().fieldErrors,
      });
    }

    if (error?.code === "P2025") {
      return ServiceResponse.error({
        success: false,
        statusCode: 404,
        message: "User not found",
        errorType: "not_found",
      });
    }

    if (error?.code === "P2002") {
      return ServiceResponse.error({
        success: false,
        statusCode: 409,
        message: "Username already taken",
        errorType: "conflict",
      });
    }

    logger.error({ error }, "❌ Unhandled error in usernameUpdateService");
    return ServiceResponse.error({
      success: false,
      statusCode: 500,
      message: "Internal server error",
      errorType: "internal_server_error",
    });
  }
};
