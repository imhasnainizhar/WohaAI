import { throwInternalError, throwConflictError, throwValidationError, throwSessionExpired } from "@packages/shared/errors";
import { logger } from "@packages/shared/utils";
import { getSignupCache, setSignupCache } from "@internals/utils/redis";
import { ContinueWithEmailDTO } from "@packages/shared/auth";
import { prisma } from "@clients/prisma";
import { ServiceException, ServiceResponse } from "@packages/shared/utils";
import { EmailSignupSchema } from "@packages/shared/auth";

/**
 * continueWithEmail api is a proceeding step after username during signup
 * if user selects username at get started step.
 */

export default async function continueWithEmailService({ signupSessionID, email }: ContinueWithEmailDTO) {
    try {
        logger.debug("Continuing with email...");

        const pending = await getSignupCache(signupSessionID);
        if (!pending) {
            throwSessionExpired();
        }

        const parsed = EmailSignupSchema.safeParse({ email: email.trim() });
        if (!parsed.success) throwValidationError(parsed.error, "email");

        const validatedEmail = parsed.data?.email;

        const emailExists = await prisma.user.findUnique({
            where: { email: validatedEmail },
        });

        if (emailExists) {
            throwConflictError("email", "This email is already in use.");
        }

        const session = typeof pending === "string" ? JSON.parse(pending) : pending;

        await setSignupCache(
            signupSessionID,
            JSON.stringify({ ...session, email: validatedEmail }),
        );

        logger.info("Email validated and cached.");

        return ServiceResponse.success({
            success: true,
            statusCode: 200,
            message: "Email is valid.",
            data: { signupSessionID },
        });

    } catch (error: any) {

        if (error instanceof ServiceException) throw error;

        logger.error({
            message: "continueWithEmail failed",
            error: error?.message,
            stack: error?.stack,
        });

        throw throwInternalError();
    }
}
