import {
  authMailerLogger,
} from "@packages/observability";

import { consumeVerificationEmail }
  from "@/consumer/verification-email-event";
import { consumeChangePasswordEmail } from "./consumer/change-password-event";

// BOOTSTRAP SERVER  
export async function bootstrapServer() {
  try {
    authMailerLogger.info(
      "Bootstrapping mailer service...",
    );

    // START ALL CONSUMERS IN PARALLEL
    await Promise.all([
      consumeVerificationEmail(),
      consumeChangePasswordEmail(),
    ]);
    authMailerLogger.info(
      "Mailer service started successfully",
    );
  } catch (error) {
    authMailerLogger.fatal(
      {
        error,
      },
      "Failed to bootstrap mailer service",
    );

    process.exit(1);
  }
}