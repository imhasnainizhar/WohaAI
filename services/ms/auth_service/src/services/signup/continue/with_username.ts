import { internalError, throwConflictError, throwValidationError } from "@errors/auth";
import { logger } from "@utils/logger";
import { getSignupCache, setSignupCache } from "@utils/redis";
import { SignupWithUsernameInterface } from "shared/domain/interfaces/auth/interface";
import { prisma } from "../../../clients/prisma";
import { env, EXPIRATION } from "@config/env";
import { ServiceException, ServiceResponse } from "@utils/response";
import { SignupUsernameSchema } from "shared/zod/schemas/auth/signup";

/**
 * continueWithUsername api is a proceeding step after username during signup
 * if user selects username at get started step.
 */

export default async function continueWithUsername({ signupSessionID, username }: SignupWithUsernameInterface) {
    try {
        logger.debug("Continuing with username...");

        const pending = await getSignupCache(signupSessionID);
        if (!pending) {
            throwValidationError("Invalid signup session ID.", "signupSessionID");
        }

        const parsed = SignupUsernameSchema.safeParse({ username: username.trim() });
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

        throw internalError();
    }
}
