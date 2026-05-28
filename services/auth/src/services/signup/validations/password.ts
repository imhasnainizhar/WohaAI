import argon2 from "argon2";
import { logger } from "@packages/observability";
import {
  SessionExpiredError,
} from "@packages/errors";
import {
  getSignupSession,
  setSignupSession,
  SignupSession,
} from "@/redis/redis";

interface PasswordValidationParams {
  signupSessionID: string;
  password: string; // already validated
}

export class PasswordValidationService {
  public async execute({
    signupSessionID,
    password,
  }: PasswordValidationParams) {
    logger.debug("Continuing signup with password...");

    const signupSession: SignupSession =
      await getSignupSession(signupSessionID);

    if (!signupSession) throw new SessionExpiredError();

    const hashedPassword = await argon2.hash(password);

    const needsUpdate =
      signupSession.hashedPassword !== hashedPassword;

    if (needsUpdate) {
      await setSignupSession({
        ...signupSession,
        hashedPassword: hashedPassword,
      });
    }

    logger.info("Password cached successfully.");

    return {
      success: true,
    };
  }
}