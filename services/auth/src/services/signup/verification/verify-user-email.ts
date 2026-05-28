import { env } from "@/config/env";
import { exp } from "@/config/exp";
import { createJwtToken } from "@packages/jwt";
import { logger } from "@packages/observability";
import {
  deleteVerificationCodeCache,
  getSignupSession,
  getVerificationCodeCache,
  setConfirmedEmailCache,
} from "@/redis/redis";
import { InvalidVerificationCodeError, SessionExpiredError } from "@packages/errors";
import { VerificationCodeExpiredError } from '@packages/errors';
import { randomUUID } from "crypto";


export interface VerifyUserEmailParams {
  signupSessionID: string;
  verificationCode: string;
}
export interface VerifyUserEmailResponse {

}

export class VerifyUserEmailService {
  /**
   * Verify signup email OTP
   */
  async execute(
    {
      verificationCode,
      signupSessionID
    }: VerifyUserEmailParams
  ): Promise<VerifyUserEmailResponse> {

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
        createJwtToken(
          {
            jti: randomUUID(),
            sub: signupSessionID,
          },
          env.JWT_SIGNUP_SESSION_SECRET_KEY,
          {
            expiresIn: Number(
              exp.JWT_SIGNUP_SESSION_TOKEN_EXTENDED
            ),
          }
        );

      await setConfirmedEmailCache({
        signupSessionID,
        email: pendingEmail
      });

      logger.info(
        `✅ Email verified successfully for session ${signupSessionID}`
      );

      return {
        success: true,
        extendedSignupToken,
      }
  }
}