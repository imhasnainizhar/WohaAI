
import { env } from "@/config/env";
import { mailerTransport } from "@/mailer";

import { authMailerLogger } from "@packages/observability";

import { forgotPasswordEmailTemplate } from "@/templates/forgot-password-email";

interface DispatchForgotPasswordEmailServiceParams {
  email: string;
  resetPasswordCode: string;
}

export async function dispatchForgotPasswordEmailService({
  email,
  resetPasswordCode,
}: DispatchForgotPasswordEmailServiceParams) {
  try {
    // BASIC VALIDATION
    if (!email) {
      throw new Error(
        "Forgot password email dispatch failed: email is required",
      );
    }

    if (!resetPasswordCode) {
      throw new Error(
        "Forgot password email dispatch failed: resetPasswordCode is required",
      );
    }

    // SEND EMAIL
    await mailerTransport.sendMail({
      from: env.MAILER_USER_EMAIL,

      to: email,

      subject: "Reset Your Password",

      html:
        forgotPasswordEmailTemplate(
          resetPasswordCode,
        ),
    });

    authMailerLogger.info(
      {
        email,
      },
      "Forgot password email sent successfully",
    );
  } catch (error) {
    authMailerLogger.error(
      {
        error,
        email,
      },
      "dispatchForgotPasswordEmailService failed",
    );

    /**
     * Rethrow clean application-level error
     * so Kafka consumer can retry safely.
     */
    throw new Error(
      `Failed to dispatch forgot password email. Error log: ${error}`,
    );
  }
}