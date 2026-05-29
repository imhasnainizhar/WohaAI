import argon2 from "argon2";
import { authLogger } from "@packages/observability";
import {
  SessionExpiredError,
} from "@packages/errors";
import {
  getSignupSession,
  setSignupSession,
  SignupSession,
} from "@/redis/redis";

export interface PasswordValidationServiceParams {
  signupSessionID: string;
  zodValidatedPassword: string; // already validated
}

export interface PasswordValidationServiceResponse {
  passwordValidated: boolean;
}

export class PasswordValidationService {
  public async execute({
    signupSessionID,
    zodValidatedPassword,
  }: PasswordValidationServiceParams): Promise<PasswordValidationServiceResponse> {
    authLogger.debug("Continuing signup with password...");

    const signupSession: SignupSession =
      await getSignupSession(signupSessionID);

    if (!signupSession) throw new SessionExpiredError();

    const hashedPassword = await argon2.hash(zodValidatedPassword);

    const needsUpdate =
      signupSession.hashedPassword !== hashedPassword;

    if (needsUpdate) {
      await setSignupSession({
        ...signupSession,
        hashedPassword: hashedPassword,
      });
    }

    authLogger.info("Password validated successfully.");

    return {
      passwordValidated: true,
    };
  }
}