import argon2 from "argon2";
import { authLogger } from "@packages/observability";
import {
  SessionExpiredError,
} from "@packages/errors";
import {
  getAuthSession,
  setAuthSession,
  AuthCacheData,
} from "@/redis/redis";

export interface PasswordValidationServiceParams {
  authSessionID: string;
  zodValidatedPassword: string;
}

export class PasswordValidationService {
  public async execute({
    authSessionID,
    zodValidatedPassword,
  }: PasswordValidationServiceParams): Promise<{ success: boolean }> {
    authLogger.debug("Continuing signup with password...");

    const signupSession: AuthCacheData =
      await getAuthSession(authSessionID);

    if (!signupSession) throw new SessionExpiredError();

    const hashedPassword = await argon2.hash(zodValidatedPassword);

    const needsUpdate =
      signupSession.hashedPassword !== hashedPassword;

    if (needsUpdate) {
      await setAuthSession(
        authSessionID,
        {
          ...signupSession,
          hashedPassword: hashedPassword,
        });
    }

    authLogger.info("Password validated successfully.");

    return {
      success: true,
    };
  }
}