import { authLogger } from "@wohaai/telemetry";
import { AuthRepo } from "@/repo/auth-repo";
import {
    ConflictError,
    SessionExpiredError,
} from "@wohaai/errors";

import {
    getAuthSession,
    setAuthSession,
    AuthCacheData,
} from "@/redis/redis";

export interface SignupEmailValidationServiceParams {
    authSessionID: string;
    email: string;
}

/**
 * Service responsible for continuing signup flow
 * with email after username step.
 */
export class SignupEmailValidationService {
    constructor(private authRepo: AuthRepo) { }

    public async execute({
        authSessionID,
        email,
    }: SignupEmailValidationServiceParams): Promise<{ success: boolean }> {
        authLogger.debug("Continuing signup with email...");

        // Fetch pending signup session
        const signupSession: AuthCacheData =
            await getAuthSession(authSessionID);

        if (!signupSession) {
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
                await this.authRepo.findUserWithEmail(
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
        await setAuthSession(
            authSessionID,
            {
                ...signupSession,
                email,
                emailVerified: false,
            }
        )

        authLogger.info(
            "Email validated and cached successfully."
        );

        return {
            success: true,
        };
    }
}