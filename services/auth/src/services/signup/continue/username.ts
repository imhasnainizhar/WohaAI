import { logger } from "@packages/observability";

import { prisma } from "@packages/prisma";

import { AuthRepo } from "@/repo/auth-repo";

import {
  ConflictError,
  SessionExpiredError,
} from "@packages/errors";

import {
  setSignupSession,
  getSignupSession,
  SignupSession,
} from "@/redis/redis";

interface ContinueWithUsernameParams {
  signupSessionID: string;
  username: string;
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
  }: ContinueWithUsernameParams) {
    logger.debug(
      "Continuing signup with username..."
    );

    // Fetch signup session
    const signupSession: SignupSession =
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
    await setSignupSession({
      ...signupSession,
      username: username,
    });

    logger.info(
      "Username validated and cached successfully."
    );

    return {
      success: true,
    };
  }
}