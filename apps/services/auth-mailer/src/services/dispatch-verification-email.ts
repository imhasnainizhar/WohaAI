import { env } from "@wohaai/env-ts";
import { mailerTransport } from "@/mailer";

import { authMailerLogger } from "@wohaai/telemetry";

import { verificationEmailTemplate } from "@/templates/verification-email";

interface DispatchVerificationEmailServiceParams {
  email: string;
  verificationCode: string;
}

export async function dispatchVerificationEmailService({
  email,
  verificationCode,
}: DispatchVerificationEmailServiceParams) {
  try {
    // BASIC VALIDATION
    if (!email) {
      throw new Error(
        "Verification email dispatch failed: email is required",
      );
    }

    if (!verificationCode) {
      throw new Error(
        "Verification email dispatch failed: verificationCode is required",
      );
    }

    // SEND EMAIL
    await mailerTransport.sendMail({
      from: env.MAILER_USER_EMAIL,

      to: email,

      subject: "Email Verification Code",

      html:
        verificationEmailTemplate(
          verificationCode,
        ),
    });

    authMailerLogger.info(
      {
        email,
      },
      "Verification email sent successfully",
    );
  } catch (error) {
    authMailerLogger.error(
      {
        error,
        email,
      },
      "dispatchVerificationEmailService failed",
    );

    /**
     * IMPORTANT:
     * Throw clean infrastructure-level error
     * instead of leaking raw provider errors.
     */
    throw new Error(
      `Failed to dispatch verification email. Error log: ${error}`
    );
  }
}