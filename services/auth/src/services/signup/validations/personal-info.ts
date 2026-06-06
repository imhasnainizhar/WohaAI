import { authLogger } from "@packages/observability";
import { AuthRepo } from "@/repo/auth-repo";
import {
  SessionExpiredError,
} from "@packages/errors";
import {
  getSignupSession,
  setSignupSession,
  SignupSessionData,
} from "@/redis/redis";
import { DateOfBirth, FirstName, LastName } from "@packages/contracts/auth";

export interface PersonalInfoValidationServiceParams {
  signupSessionID: string;
  firstName: FirstName;
  lastName: LastName;
  dateOfBirth: DateOfBirth
}

export interface PersonalInfoValidationServiceResponse {
  personalInfoValidated: boolean;
}

export class PersonalInfoValidationService {

  public async execute({
    signupSessionID,
    firstName,
    lastName,
    dateOfBirth
  }: PersonalInfoValidationServiceParams): Promise<PersonalInfoValidationServiceResponse> {
    authLogger.debug("Continuing signup with personal info...");

    const signupSession: SignupSessionData =
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

    if (signupSession.dateOfBirth !== dateOfBirth) {
      signupSession.dateOfBirth = dateOfBirth;
      updated = true;
    }

    if (updated) {
      await setSignupSession(
        signupSessionID,
        {
          ...signupSession,
          firstName,
          lastName,
        });
    }

    authLogger.info("Personal info validated successfully.");

    return {
      personalInfoValidated: true,
    };
  }
}