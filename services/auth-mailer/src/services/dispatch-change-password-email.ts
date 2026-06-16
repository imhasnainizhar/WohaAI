
import { env } from "@packages/env-ts";
import { mailerTransport } from "@/mailer";

import { authMailerLogger } from "@packages/observability";

import { changePasswordEmailTemplate } from "@/templates/change-password-email";

interface DispatchChangePasswordEmailServiceParams {
  email: string;
  resetPasswordCode: string;
}

export async function dispatchChangePasswordEmailService({
  email,
  resetPasswordCode,
}: DispatchChangePasswordEmailServiceParams) {
  try {
    // BASIC VALIDATION
    if (!email) {
      throw new Error(
        "Change password email dispatch failed: email is required",
      );
    }

    if (!resetPasswordCode) {
      throw new Error(
        "Change password email dispatch failed: resetPasswordCode is required",
      );
    }

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

    authMailerLogger.info(
      {
        email,
      },
      "Change password email sent successfully",
    );
  } catch (error) {
    authMailerLogger.error(
      {
        error,
        email,
      },
      "dispatchChangePasswordEmailService failed",
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