import { prisma } from "@utils/prisma_client";
import { ZodError } from "zod";
import { logger } from "@utils/logger";
import { ServiceResponse } from "@utils/service_response";
import { ServiceException } from "@utils/response";
import { NameUpdate } from "@custom_types/update_types/name_update.type";

/**
 * @service nameUpdateService
 * Handles updating user's first and last name.
 * Returns a standardized ServiceResponse.
 */
export const nameUpdateService = async ({ userID, firstName, lastName }: NameUpdate) => {
    try {
        // Update user in database
        const updatedUser = await prisma.user.update({
            where: { userID: userID },
            data: {
                userFirstName: firstName,
                userLastName: lastName,
            },
            select: { userID: true, userFirstName: true, userLastName: true },
        });

        // Return success response
        return ServiceResponse.success({
            success: true,
            statusCode: 200,
            message: "Name updated successfully",
            data: updatedUser,
        });

    } catch (error: any) {

        // Prisma record not found
        if (error.code === "P2025") {
            logger.debug(`❌${error.message}`)
            throw new ServiceException(
                ServiceResponse.error({
                    success: false,
                    statusCode: 404,
                    message: "User not found",
                    errorType: "not_found",
                })
            )
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
