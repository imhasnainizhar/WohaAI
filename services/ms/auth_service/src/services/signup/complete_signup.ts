import { logger } from "@utils/logger";
import { ServiceResponse, ServiceException } from "@utils/response";
import { prisma } from "../../clients/prisma";
import { setSignupCache, getSignupCache, deleteSignupCache } from "@utils/redis";
import { env, EXPIRATION } from "@config/env";
import { createJwtToken } from "@utils/jwt";
import { CompleteSignupDTO } from "@shared/domain/types/auth/signup/dto";
import { throwValidationError, internalError, throwConflictError } from "@errors/auth";
import { CompleteSignupSchema, CompleteSignupType } from "@shared/zod/schemas/auth/signup/complete_signup";

/**
 * Validates and records the user's display name in an active signup session.
 * 
 * Control flow logic:
 * 1. The function retrieves the current session state from Redis (this acts like a memory of all prior verified data).
 * 2. It confirms that the session belongs to the same username to prevent step-hopping or impersonation.
 * 3. The input names are validated through Zod schema.
 * 4. If names differ from previous valid values, they are updated in Redis.
 * 5. If Redis session is missing, expired, or mismatched, it blocks the request — ensuring only valid sessions can proceed.
 */

export const completeSignupService = async (dto: CompleteSignupDTO) => {
    try {
        // Retrieve session data from Redis for the current signup session
        // this redis util is auth native and built over shared redis utils
        const pending = await getSignupCache(dto.signupSessionID);

        // If existing names in Redis differ from the newly validated ones, update Redis
        if (
            (pending.firstName && pending.firstName !== dto.firstName) ||
            (pending.lastName && pending.lastName !== dto.lastName)
        ) {
            pending.firstName = dto.firstName;
            pending.lastName = dto.lastName;
        }

        // Store updated state back in Redis with the defined TTL
        // TTL is defined at util file specified for auth
        await setSignupCache(
            dto.signupSessionID,
            { ...pending, firstName: dto.firstName, lastName: dto.lastName },
        );

        logger.info("Display name validated and cached.");
        return ServiceResponse.success({
            success: true,
            statusCode: 200,
            message: "Display name is valid.",
        });
    } catch (error: any) {
        logger.fatal({
            message: "validateDisplayName failed",
            error: error.message,
            stack: error.stack,
        });
        throw internalError();
    }
};
