import { authLogger } from "@packages/observability";
import { AuthRepo } from "@/repo/auth-repo";
import {
  ConflictError,
  SessionExpiredError,
} from "@packages/errors";

import {
  setAuthSession,
  getAuthSession,
  AuthCacheData,
} from "@/redis/redis";

export interface SignupUsernameValidationServiceParams {
  authSessionID: string;
  username: string;
}

/**
 * Service responsible for continuing signup flow
 * with username after email step.
 */
export class SignupUsernameValidationService {

  constructor(private authRepo: AuthRepo) { }

  public async execute({
    authSessionID,
    username,
  }: SignupUsernameValidationServiceParams): Promise<{success: boolean}> {
    authLogger.debug(
      "Continuing signup with username..."
    );

    // Fetch signup session
    const signupSession: AuthCacheData =
      await getAuthSession(
        authSessionID
      );

    if (!signupSession) throw new SessionExpiredError();

    /**
     * If username already exists in session
     * and user is re-submitting same username,
     * skip DB availability check.
     */
    if (
      signupSession.username !==
      username
    ) {
      const usernameExists =
        await this.authRepo.findUserWithUsername(
          username
        );

      if (usernameExists) {
        throw new ConflictError(
          "username",
          "This username is already taken."
        );
      }
    }

    // Update redis session
    await setAuthSession(
      authSessionID,
      {
        ...signupSession,
        username: username,
      });

    authLogger.info(
      "Username validated and cached successfully."
    );

    return {
      success: true,
    };
  }
}