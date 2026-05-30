import { authLogger } from "@packages/observability";
import { AuthRepo } from "@/repo/auth-repo";
import {
    ConflictError,
    SessionExpiredError,
} from "@packages/errors";

import {
    getSignupSession,
    setSignupSession,
    SignupSessionData,
} from "@/redis/redis";

export interface ContinueWithEmailServiceParams {
    signupSessionID: string;
    email: string;
}

export interface ContinueWithEmailServiceResponse {
    emailValidated: boolean;
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
    }: ContinueWithEmailServiceParams): Promise<ContinueWithEmailServiceResponse> {
        authLogger.debug("Continuing signup with email...");

        // Fetch pending signup session
        const signupSession: SignupSessionData =
            await getSignupSession(signupSessionID);

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
            signupSessionID,
            {
                ...signupSession,
                email
            }
        )

        authLogger.info(
            "Email validated and cached successfully."
        );

        return {
            emailValidated: true,
        };
    }
}