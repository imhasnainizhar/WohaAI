import { env } from "@wohaai/env-ts";
import exp from "../../../../../../packages/config/exp.json";
import { createJwtToken, AuthSessionPayload } from "@wohaai/security/jwt";
import { authLogger } from "@wohaai/telemetry";
import {
  deleteVerificationCodeCache,
  getAuthSession,
  getVerificationCodeCache,
  setAuthSession,
} from "@/redis/redis";
import { SessionExpiredError } from "@wohaai/errors";
import { randomUUID } from "crypto";
import { SignOptions } from "jsonwebtoken";
import { InvalidVerificationCodeError, VerificationCodeExpiredError } from "@/errors/service-error";


export interface VerifyUserEmailServiceParams {
  authSessionID: string;
  verificationCode: string;
}

export interface VerifyUserEmailServiceResponse {
  authToken: string
}

export class VerifyUserEmailService {
  /**
   * Verify signup email OTP
   */
  async execute(
    {
      verificationCode,
      authSessionID
    }: VerifyUserEmailServiceParams
  ): Promise<VerifyUserEmailServiceResponse> {

    // fetch pending signup session
    const signupSession =
      await getAuthSession(authSessionID);

    if (!signupSession) throw new SessionExpiredError

    // As we are following a step by step signup flow, email will be present in cache temp session if signup session is not expired.
    const pendingEmail =
      signupSession.email!;

    // fetch OTP cache
    const cache = await getVerificationCodeCache(authSessionID);

    authLogger.debug(cache)
    if (!cache) throw new VerificationCodeExpiredError();

    // validate OTP 
    if (
      cache.verificationCode !==
      verificationCode
    ) throw new InvalidVerificationCodeError();

    // invalidate OTP after successful verification
    await deleteVerificationCodeCache(authSessionID)

    // generate extended signup token
    const authToken =
      createJwtToken<AuthSessionPayload>({
        payload: {
          jti: randomUUID(),
          sub: authSessionID,
        },
        secret: env.JWT_AUTH_SECRET_KEY,
        options: {
          expiresIn: exp.JWT_AUTH_SESSION_TOKEN,
        } as SignOptions
      });

    await setAuthSession(
      authSessionID,
      {
        ...signupSession,
        emailVerified: true
      }
    );

    authLogger.info(
      `✅ Email verified successfully for session ${authSessionID}`
    );

    return {
      authToken,
    }
  }
}