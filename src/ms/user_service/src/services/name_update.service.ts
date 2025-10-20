// services/name_update.service.ts
import { NameUpdateSchema, NameUpdate } from "@schemas/name_update.schema";
import { prisma } from "@utils/prisma_client";
import { ZodError } from "zod";
import { logger } from "@utils/logger";
import { ServiceResponse } from "@utils/service_response";
import { ServiceException } from "@errors/service_exception";

/**
 * @service nameUpdateService
 * Handles updating user's first and last name.
 * Returns a standardized ServiceResponse.
 */
export const nameUpdateService = async (body: NameUpdate) => {
    try {
        // Validate request body
        const parsed = NameUpdateSchema.parse(body);

        // Update user in database
        const updatedUser = await prisma.user.update({
            where: { id: parsed.userID },
            data: {
                firstName: parsed.firstName,
                lastName: parsed.lastName,
            },
            select: { id: true, firstName: true, lastName: true },
        });

        // Return success response
        return ServiceResponse.success({
            success: true,
            statusCode: 200,
            message: "Name updated successfully",
            data: updatedUser,
        });

    } catch (error: any) {
        // Handle validation errors
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

        // Unexpected errors
        logger.error({ error }, "❌ Unhandled error in nameUpdateService");
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
