import {
  authMailerLogger,
} from "@wohaai/telemetry";

import { consumeVerificationEmail }
  from "@/consumer/verification-email-event";
import { consumeChangePasswordEmail } from "./consumer/change-password-event";

// BOOTSTRAP SERVER  
export async function bootstrapServer() {
  try {
    authMailerLogger.info(
      "✅ Bootstrapping mailer service...",
    );

    authMailerLogger.debug(
      "✅ Starting Kafka consumers in parallel",
    );

    // START ALL CONSUMERS IN PARALLEL
    await Promise.all([
      consumeVerificationEmail(),
      consumeChangePasswordEmail(),
    ]);

    authMailerLogger.debug(
      "All Kafka consumers started successfully",
    );

    authMailerLogger.info(
      "✅ Mailer service started successfully",
    );
  } catch (error) {
    authMailerLogger.debug(
      "Error during service bootstrap",
    );

    authMailerLogger.fatal(
      {
        error,
      },
      "❌ Failed to bootstrap mailer service",
    );

    process.exit(1);
  }
}