
import { env } from "@wohaai/env-ts";
import { mailerTransport } from "@/mailer";

import { authMailerLogger } from "@wohaai/telemetry";

import { changePasswordEmailTemplate } from "@/templates/change-password-email";

interface DispatchChangePasswordEmailServiceParams {
  email: string;
  resetPasswordCode: string;
}

export async function dispatchChangePasswordEmailService({
  email,
  resetPasswordCode,
}: DispatchChangePasswordEmailServiceParams) {
  authMailerLogger.debug({ email }, "Starting change password email dispatch");

  try {
    // BASIC VALIDATION
    authMailerLogger.debug("Validating email parameter");
    if (!email) {
      authMailerLogger.debug("Email validation failed: email is missing");
      throw new Error(
        "Change password email dispatch failed: email is required",
      );
    }

    authMailerLogger.debug("Validating resetPasswordCode parameter");
    if (!resetPasswordCode) {
      authMailerLogger.debug("Reset password code validation failed: code is missing");
      throw new Error(
        "Change password email dispatch failed: resetPasswordCode is required",
      );
    }

    authMailerLogger.debug({ email, subject: "Change Your Password" }, "Preparing to send change password email");

    // SEND EMAIL
    await mailerTransport.sendMail({
      from: env.MAILER_USER_EMAIL,

      to: email,

      subject: "Change Your Password",

      html:
        changePasswordEmailTemplate(
          resetPasswordCode,
        ),
    });

    authMailerLogger.debug({ email }, "Change password email sent via mailer transport");

    authMailerLogger.info(
      {
        email,
      },
      "✅ Change password email sent successfully",
    );
  } catch (error) {
    authMailerLogger.debug({ email }, "Change password email dispatch failed");
    authMailerLogger.error(
      {
        error,
        email,
      },
      "❌ dispatchChangePasswordEmailService failed",
    );

    /**
     * Rethrow clean application-level error
     * so Kafka consumer can retry safely.
     */
    throw new Error(
      `Failed to dispatch change password email. Error log: ${error}`,
    );
  }
}