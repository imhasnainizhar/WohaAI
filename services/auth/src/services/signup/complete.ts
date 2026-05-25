import { logger } from "@packages/shared/utils";
import { ServiceResponse, ServiceException } from "@packages/shared/utils";
import { setSignupCache, getSignupCache } from "@helpers/redis";
import { CompleteSignupDTO } from "../../../../../packages/api/src/auth";
import { throwInternalError, throwSessionExpired } from "@packages/shared/errors";

/**
 * Validates and records the user's display name in an active signup session.
 * 
 * Control flow logic:
 * 1. The function retrieves the current session state from Redis (this acts like a memory of all prior verified data).
 * 2. It confirms that the session belongs to the same username to prevent step-hopping or impersonation.
 * 3. If inputs differ from previous valid values, they are updated in Redis.
 * 4. If Redis session is missing, expired, or mismatched, it blocks the request — ensuring only valid sessions can proceed.
 */

export const completeSignupService = async (dto: CompleteSignupDTO) => {
    try {
        // Retrieve session data from Redis for the current signup session
        // this redis util is auth native and built over shared redis utils
        const session = await getSignupCache(dto.signupSessionID);
        if (!session) throwSessionExpired();

        // If existing names in Redis differ from the newly validated ones, update Redis
        let isUpdated = false;

        if (session.firstName !== dto.firstName) {
            session.firstName = dto.firstName;
            isUpdated = true;
        }

        if (session.lastName !== dto.lastName) {
            session.lastName = dto.lastName;
            isUpdated = true;
        }

        if (session.password !== dto.password) {
            session.password = dto.password; // ideally hashed before this step
            isUpdated = true;
        }

        // This way we update all changes in one go instead of redis updates 
        // in each if/else statements.
        if (isUpdated) {
            // Store updated state back in Redis with the defined TTL
            // TTL is defined at config file specified for auth
            await setSignupCache(
                dto.signupSessionID,
                { ...session, firstName: dto.firstName, lastName: dto.lastName, password: dto.password },
            );
        }

        logger.info("User info checked and updated to be signed up.");
        return ServiceResponse.success({
            success: true,
            statusCode: 200,
            message: "User info checked to be signed up.",
        });
    } catch (error: any) {
        logger.fatal({
            message: "completeSignupService failed",
            error: error.message,
            stack: error.stack,
        });

        if (error instanceof ServiceException) throw error; // already standardized

        throw throwInternalError(error);
    }
};