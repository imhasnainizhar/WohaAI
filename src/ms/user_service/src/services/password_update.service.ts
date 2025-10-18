import { PasswordUpdateSchema } from "@schemas/password_update.schema";
import { prisma } from "@utils/prisma_client";
import argon2 from "argon2";
import { ZodError } from "zod";

export const passwordUpdateService = async (body: PasswordUpdateSchema) => {
  try {
    // Validate input with Zod
    const parsed = PasswordUpdateSchema.parse(body);
    const { confirmNewPassword, userID } = parsed;

    // Hash password
    const hashedPassword = await argon2.hash(confirmNewPassword);

    // Update user password in database
    const updatedUser = await prisma.user.update({
      where: { id: userID },
      data: { hashedPassword },
      select: { id: true, email: true }, // return minimal info, never full record
    });

    return {
      success: true,
      message: "Password updated successfully",
      data: updatedUser,
    };
  } catch (error: unknown) {
    // Handle Zod validation errors
    if (error instanceof ZodError) {
      return {
        success: false,
        statusCode: 400,
        message: "Validation failed",
        errors: error.flatten().fieldErrors,
      };
    }

    // Handle Prisma not found error
    if (typeof error === "object" && error !== null && (error as any).code === "P2025") {
      return {
        success: false,
        statusCode: 404,
        message: "User not found",
      };
    }

    // Fallback for unexpected errors
    console.error("Password update error:", error);
    return {
      success: false,
      statusCode: 500,
      message: "Internal server error",
    };
  }
};
