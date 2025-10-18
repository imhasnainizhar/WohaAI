import { emailUpdateSchema, EmailUpdate } from "@schemas/email_update.schema";
import { prisma } from "@utils/prisma_client";
import { ZodError } from "zod";

export const emailUpdateService = async (body: EmailUpdate) => {
  try {
    const parsed = emailUpdateSchema.parse(body);
    const { userID, email } = parsed;

    const updatedUser = await prisma.user.update({
      where: { id: userID },
      data: { email: email },
      select: { id: true, email: true },
    });

    return {
      success: true,
      message: "Email updated successfully",
      data: updatedUser,
    };
  } catch (error) {
    if (error instanceof ZodError) {
      return {
        success: false,
        statusCode: 400,
        message: "Validation failed",
        errors: error.flatten().fieldErrors,
      };
    }

    if (typeof error === "object" && error !== null && (error as any).code === "P2025") {
      return {
        success: false,
        statusCode: 404,
        message: "User not found",
      };
    }

    if (typeof error === "object" && error !== null && (error as any).code === "P2002") {
      return {
        success: false,
        statusCode: 409,
        message: "Email already in use",
      };
    }

    console.error("Email update error:", error);
    return {
      success: false,
      statusCode: 500,
      message: "Internal server error",
    };
  }
};
