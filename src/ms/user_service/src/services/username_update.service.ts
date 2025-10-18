import { usernameUpdateSchema, UsernameUpdate } from "@schemas/username_update.schema";
import { prisma } from "@utils/prisma_client";
import { ZodError } from "zod";

export const usernameUpdateService = async (body: UsernameUpdate) => {
  try {
    const parsed = usernameUpdateSchema.parse(body);
    const { userID, username } = parsed;

    const updatedUser = await prisma.user.update({
      where: { id: userID },
      data: { username: username },
      select: { id: true, username: true },
    });

    return {
      success: true,
      message: "Username updated successfully",
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
        message: "Username already taken",
      };
    }

    console.error("Username update error:", error);
    return {
      success: false,
      statusCode: 500,
      message: "Internal server error",
    };
  }
};
