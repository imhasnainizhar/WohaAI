import { throwInternalError, throwConflictError, throwValidationError, throwSessionExpired } from "@packages/shared/errors";
import { logger } from "@packages/shared/utils";
import { getSignupCache, setSignupCache } from "@helpers/redis";
import { prisma } from "@clients/prisma";
import { ServiceException, ServiceResponse } from "@packages/shared/utils";
import { UsernameSignupSchema } from "../../../../../../packages/api/src/auth";
import { ContinueWithUsernameDTO } from "../../../../../../packages/api/src/auth";


/**
 * continueWithUsername api is a proceeding step after username during signup
 * if user selects username at get started step.
 */

export default async function continueWithUsernameService({ signupSessionID, username }: ContinueWithUsernameDTO) {
    try {
        logger.debug("Continuing with username...");

        const pending = await getSignupCache(signupSessionID);
        if (!pending) {
            throwSessionExpired();
        };

        const parsed = UsernameSignupSchema.safeParse({ username: username.trim() });
        if (!parsed.success) throwValidationError(parsed.error, "username");

        const validatedUsername = parsed.data?.username;

        const usernameExists = await prisma.user.findUnique({
            where: { username: validatedUsername },
        });

        if (usernameExists) {
            throwConflictError("username", "This username is already in use.");
        }

        const session = typeof pending === "string" ? JSON.parse(pending) : pending;

        await setSignupCache(
            signupSessionID,
            JSON.stringify({ ...session, username: validatedUsername }),
        );

        logger.info("Username validated and cached.");

        return ServiceResponse.success({
            success: true,
            statusCode: 200,
            message: "Username is valid.",
            data: { signupSessionID },
        });

    } catch (error: any) {

        if (error instanceof ServiceException) throw error;

        logger.error({
            message: "continueWithUsername failed",
            error: error?.message,
            stack: error?.stack,
        });

        throw throwInternalError();
    }
}
