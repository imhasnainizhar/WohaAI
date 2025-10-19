import { emailUpdateSchema, EmailUpdate } from "@schemas/email_update.schema";
import { prisma } from "@utils/prisma_client";
import { ZodError } from "zod";
import { logger } from "@utils/logger";

export const emailUpdateService = async (body: EmailUpdate) => {
  try {
    // Validate incoming body using Zod
    const parsed = emailUpdateSchema.parse(body);
    const { userID, email } = parsed;

    // Attempt to update the user's email in DB
    const updatedUser = await prisma.user.update({
      where: { id: userID },
      data: { email },
      select: { id: true, email: true },
    });

    // Successful result returned to controller
    return {
      success: true,
      message: "Email updated successfully",
      data: updatedUser,
    };
  } catch (error: any) {
    // Zod schema validation failure
    if (error instanceof ZodError) {
      throw {
        success: false,
        statusCode: 400,
        message: "Validation failed",
        errors: error.flatten().fieldErrors,
        errorType: "validation_error",
      };
    }

    // Prisma: Record not found
    if (error.code === "P2025") {
      throw {
        success: false,
        statusCode: 404,
        message: "User not found",
        errorType: "not_found",
      };
    }

    // Prisma: Unique constraint violation
    if (error.code === "P2002") {
      throw {
        success: false,
        statusCode: 409,
        message: "Email already in use",
        errorType: "conflict",
      };
    }

    // Unexpected or unknown error
    logger.error({ error }, "Unhandled error in emailUpdateService");
    throw {
      success: false,
      statusCode: 500,
      message: "Internal server error",
      errorType: "internal_server_error",
    };
  }
};
