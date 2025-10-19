// services/password_update.service.ts
import { PasswordUpdateSchema, PasswordUpdate } from "@schemas/password_update.schema";
import { prisma } from "@utils/prisma_client";
import argon2 from "argon2";
import { ZodError } from "zod";
import { logger } from "@utils/logger";
import { ServiceResponse } from "@utils/service_response";
import { ServiceException } from "@errors/service_exception";

/**
 * @service passwordUpdateService
 * Handles updating user's password.
 * - Validates input using Zod
 * - Hashes new password
 * - Updates user record in DB
 * - Returns a standardized ServiceResponse
 */
export const passwordUpdateService = async (body: PasswordUpdate) => {
  try {
    // Validate request body
    const parsed = PasswordUpdateSchema.parse(body);
    const { confirmNewPassword, userID } = parsed;

    // Hash new password
    const hashedPassword = await argon2.hash(confirmNewPassword);

    // Update password in database
    const updatedUser = await prisma.user.update({
      where: { id: userID },
      data: { hashedPassword },
      select: { id: true, email: true },
    });

    // Return success
    return ServiceResponse.success({
      success: true,
      statusCode: 200,
      message: "Password updated successfully",
      data: updatedUser,
    });

  } catch (error: any) {
    // Handle Zod validation errors
    if (error instanceof ZodError) {
      return ServiceResponse.error({
        success: false,
        statusCode: 400,
        message: "Validation failed",
        errorType: "validation_error",
        errors: error.flatten().fieldErrors,
      });
    }

    // Prisma: record not found
    if (error?.code === "P2025") {
      return ServiceResponse.error({
        success: false,
        statusCode: 404,
        message: "User not found",
        errorType: "not_found",
      });
    }

    // Log unexpected errors
    logger.error({ error }, "❌ Unhandled error in passwordUpdateService");

    return ServiceResponse.error({
      success: false,
      statusCode: 500,
      message: "Internal server error",
      errorType: "internal_server_error",
    });
  }
};
