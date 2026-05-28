import { logger } from "@packages/observability";
import { AuthRepo } from "@/repo/auth-repo";
import {
  SessionExpiredError,
} from "@packages/errors";
import {
  getSignupSession,
  setSignupSession,
  SignupSession,
} from "@/redis/redis";

interface NameValidationParams {
  signupSessionID: string;
  firstName: string;
  lastName: string;
}

export class NameValidationService {

  public async execute({
    signupSessionID,
    firstName,
    lastName,
  }: NameValidationParams) {
    logger.debug("Continuing signup with name...");

    const signupSession: SignupSession =
      await getSignupSession(signupSessionID);

    if (!signupSession) throw new SessionExpiredError();

    let updated = false;

    if (signupSession.firstName !== firstName) {
      signupSession.firstName = firstName;
      updated = true;
    }

    if (signupSession.lastName !== lastName) {
      signupSession.lastName = lastName;
      updated = true;
    }

    if (updated) {
      await setSignupSession({
        ...signupSession,
        firstName,
        lastName,
      });
    }

    logger.info("Name cached successfully.");

    return {
      success: true,
    };
  }
}