// services/name_update.service.ts
import { NameUpdateSchema } from "@schemas/name_update.schema";
import { prisma } from "@utils/prisma_client";
import { z, ZodError } from "zod";

export const nameUpdateService = async (body: NameUpdateSchema) => {
    const parsed = NameUpdateSchema.parse(body);

    try {
        return prisma.user.update({
            where: { id: parsed.userID },
            data: {
                firstName: parsed.firstName,
                lastName: parsed.lastName,
            },
        });
    } catch (error: any) {
        if (error instanceof ZodError) {
            return {
                success: false,
                statusCode: 400,
                message: "Validation failed",
                errors: error.flatten().fieldErrors,
            };
        }
        if (error.code === "P2025") { // Prisma record not found
            return {
                success: false,
                statusCode: 404,
                message: "User not found",
            };
        }
        console.error("❌ Prisma error in nameUpdateService:", error);
        return {
            success: false,
            statusCode: 500,
            message: "Internal server error",
        };
    }
};
