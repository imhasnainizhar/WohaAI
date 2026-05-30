import { authLogger } from "@packages/observability";
import { AuthRepo } from "@/repo/auth-repo";
import {
  ConflictError,
  SessionExpiredError,
} from "@packages/errors";

import {
  setSignupSession,
  getSignupSession,
  SignupSessionData,
} from "@/redis/redis";

export interface ContinueWithUsernameServiceParams {
  signupSessionID: string;
  username: string;
}

export interface ContinueWithUsernameServiceResponse {
  usernameValidated: boolean
}

/**
 * Service responsible for continuing signup flow
 * with username after email step.
 */
export class ContinueWithUsernameService {

  constructor(private authRepo: AuthRepo) { }

  public async execute({
    signupSessionID,
    username,
  }: ContinueWithUsernameServiceParams): Promise<ContinueWithUsernameServiceResponse> {
    authLogger.debug(
      "Continuing signup with username..."
    );

    // Fetch signup session
    const signupSession: SignupSessionData =
      await getSignupSession(
        signupSessionID
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
    await setSignupSession(
      signupSessionID,
      {
        ...signupSession,
        username: username,
      });

    authLogger.info(
      "Username validated and cached successfully."
    );

    return {
      usernameValidated: true,
    };
  }
}