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
  authMailerLogger.debug(
    {
      email,
    },
    "Starting verification email dispatch",
  );

  try {
    // BASIC VALIDATION
    authMailerLogger.debug(
      "Validating email parameter",
    );

    if (!email) {
      authMailerLogger.debug(
        "Email validation failed: email is missing",
      );

      throw new Error(
        "Verification email dispatch failed: email is required",
      );
    }

    authMailerLogger.debug(
      "Validating verificationCode parameter",
    );

    if (!verificationCode) {
      authMailerLogger.debug(
        "Verification code validation failed: code is missing",
      );

      throw new Error(
        "Verification email dispatch failed: verificationCode is required",
      );
    }

    authMailerLogger.debug(
      {
        email,
        subject: "Email Verification Code",
      },
      "✅ Preparing to send verification email",
    );

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

    authMailerLogger.debug(
      {
        email,
      },
      "Verification email sent via mailer transport",
    );

    authMailerLogger.info(
      {
        email,
      },
      "✅ Verification email sent successfully",
    );
  } catch (error) {
    authMailerLogger.debug(
      {
        email,
      },
      "Verification email dispatch failed",
    );

    authMailerLogger.error(
      {
        error,
        email,
      },
      "❌ dispatchVerificationEmailService failed",
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