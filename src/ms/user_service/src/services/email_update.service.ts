import { emailUpdateSchema, EmailUpdate } from "@schemas/email_update.schema";
import { prisma } from "@utils/prisma_client";
import { ZodError } from "zod";
import { logger } from "@utils/logger";
import { ServiceResponse } from "@utils/service_response";
import { ServiceException } from "@errors/service_exception";

/**
 * @service emailUpdateService
 * Handles updating a user's email in the database.
 * Returns a ServiceResponse for both success and validation/DB errors.
 */
export const emailUpdateService = async (body: EmailUpdate) => {
  try {
    // Validate input using Zod
    const parsed = emailUpdateSchema.parse(body);
    const { userID, email } = parsed;

    // Update the user's email
    const updatedUser = await prisma.user.update({
      where: { id: userID },
      data: { email },
      select: { id: true, email: true },
    });

    // Return success response
    return ServiceResponse.success({
      success: true,
      statusCode: 200,
      message: "Email updated successfully",
      data: updatedUser,
    });

  } catch (error: any) {
    // Validation errors
    if (error instanceof ZodError) {
      return ServiceResponse.error({
        success: false,
        statusCode: 400,
        message: "Validation failed",
        errorType: "validation_error",
        errors: error.flatten().fieldErrors,
      });
    }

    // Prisma record not found
    if (error.code === "P2025") {
      return ServiceResponse.error({
        success: false,
        statusCode: 404,
        message: "User not found",
        errorType: "not_found",
      });
    }

    // Prisma unique constraint violation
    if (error.code === "P2002") {
      return ServiceResponse.error({
        success: false,
        statusCode: 409,
        message: "Email already in use",
        errorType: "conflict",
      });
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
