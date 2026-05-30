import { env } from "@/config/env";
import { exp } from "@/config/exp";
import { createJwtToken, SignupSessionPayload } from "@packages/jwt";
import { authLogger } from "@packages/observability";
import {
  deleteVerificationCodeCache,
  getSignupSession,
  getVerificationCodeCache,
  setConfirmedEmailCache,
  setSignupSession,
} from "@/redis/redis";
import { InvalidVerificationCodeError, SessionExpiredError } from "@packages/errors";
import { VerificationCodeExpiredError } from '@packages/errors';
import { randomUUID } from "crypto";
import { SignOptions } from "jsonwebtoken";


export interface VerifyUserEmailServiceParams {
  signupSessionID: string;
  verificationCode: string;
}

export interface VerifyUserEmailServiceResponse {
  extendedSignupToken: string
}

export class VerifyUserEmailService {
  /**
   * Verify signup email OTP
   */
  async execute(
    {
      verificationCode,
      signupSessionID
    }: VerifyUserEmailServiceParams
  ): Promise<VerifyUserEmailServiceResponse> {

      // fetch pending signup session
      const signupSession =
        await getSignupSession(signupSessionID);

      if (!signupSession) throw new SessionExpiredError

      // As we are following a step by step signup flow, email will be present in cache temp session if signup session is not expired.
      const pendingEmail =
        signupSession.email!;

      // fetch OTP cache
      const cachedVerificationCode = await getVerificationCodeCache(signupSessionID);

      if(!cachedVerificationCode) throw new VerificationCodeExpiredError();

      // validate OTP 
      if (
        cachedVerificationCode !==
        verificationCode
      ) throw new InvalidVerificationCodeError();

      // invalidate OTP after successful verification
      await deleteVerificationCodeCache(signupSessionID)

      // generate extended signup token
      const extendedSignupToken =
        createJwtToken<SignupSessionPayload>({
          payload: {
            jti: randomUUID(),
            sub: signupSessionID,
          },
          secret: env.JWT_SIGNUP_SESSION_SECRET_KEY,
          options: {
            expiresIn: exp.JWT_SIGNUP_SESSION_TOKEN_EXTENDED,
          } as SignOptions
  });

      await setConfirmedEmailCache({
        signupSessionID,
        email: pendingEmail
      });

      // to refresh expiry (ttl)
      await setSignupSession(
        signupSessionID,
        {
          ...signupSession
        }
      )

      authLogger.info(
        `✅ Email verified successfully for session ${signupSessionID}`
      );

      return {
        extendedSignupToken,
      }
  }
}