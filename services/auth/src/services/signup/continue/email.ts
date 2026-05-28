import { logger } from "@packages/observability";

import { AuthRepo } from "@/repo/auth-repo";

import {
    ConflictError,
    SessionExpiredError,
} from "@packages/errors";

import {
    getSignupSession,
    setSignupSession,
    SignupSession,
} from "@/redis/redis";
import { prisma } from "@packages/prisma";

interface ContinueWithEmailParams {
    signupSessionID: string;
    email: string;
}

/**
 * Service responsible for continuing signup flow
 * with email after username step.
 */
export class ContinueWithEmailService {
    constructor(private authRepo: AuthRepo) { }

    public async execute({
        signupSessionID,
        email,
    }: ContinueWithEmailParams) {
        logger.debug("Continuing signup with email...");

        // Fetch pending signup session
        const signupSession: SignupSession =
            await getSignupSession(signupSessionID);

        if (!pending) {
            throw new SessionExpiredError();
        }

        /**
         * If username already exists in session
         * and user is re-submitting same username,
         * skip DB availability check.
         */
        if (
            signupSession.email !==
            email
        ) {
            const emailExists =
                await this.authRepo.findUserWithUsername(
                    email
                );

            if (emailExists) {
                throw new ConflictError(
                    "email",
                    "This email is already in use."
                );
            }
        }

        // Update signup session
        await setSignupSession(
            {
                ...signupSession,
                email
            }
        )

        logger.info(
            "Email validated and cached successfully."
        );

        return {
            success: true,
        };
    }
}