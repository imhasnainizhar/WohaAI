import { internalError, throwConflictError, throwValidationError } from "@errors/auth";
import { logger } from "@utils/logger";
import { getSignupCache, setSignupCache } from "@utils/redis";
import { ContinueWithEmailDTO } from "@shared/domain/interfaces/auth/signup/dto";
import { prisma } from "../../../clients/prisma";
import { env, EXPIRATION } from "@config/env";
import { ServiceException, ServiceResponse } from "@utils/response";
import { EmailSignupSchema } from "@shared/zod/schemas/auth/signup/continue/with_email";

/**
 * continueWithEmail api is a proceeding step after username during signup
 * if user selects username at get started step.
 */

export default async function continueWithEmailService({ signupSessionID, email }: ContinueWithEmailDTO) {
    try {
        logger.debug("Continuing with email...");

        const pending = await getSignupCache(signupSessionID);
        if (!pending) {
            throwValidationError("Invalid signup session ID.", "signupSessionID");
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

        throw internalError();
    }
}
