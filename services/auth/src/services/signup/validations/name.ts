import { authLogger } from "@packages/observability";
import { AuthRepo } from "@/repo/auth-repo";
import {
  SessionExpiredError,
} from "@packages/errors";
import {
  getSignupSession,
  setSignupSession,
  SignupSession,
} from "@/redis/redis";

export interface NameValidationServiceParams {
  signupSessionID: string;
  firstName: string;
  lastName: string;
}

export interface NameValidationServiceResponse {
  nameValidated: boolean;
}

export class NameValidationService {

  public async execute({
    signupSessionID,
    firstName,
    lastName,
  }: NameValidationServiceParams): Promise<NameValidationServiceResponse> {
    authLogger.debug("Continuing signup with name...");

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

    authLogger.info("Name validated successfully.");

    return {
      nameValidated: true,
    };
  }
}