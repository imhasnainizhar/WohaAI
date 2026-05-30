// src/bootstrap/server.bootstrap.ts

import {
    authMailerLogger,
  } from "@packages/observability";
  
  import { consumeVerificationEmail }
    from "@/consumer/verification-email-event";
import { consumeForgotPasswordEmail } from "./consumer/forgot-password-event";
  
  // BOOTSTRAP SERVER  
  export async function bootstrapServer() {
    try {
      authMailerLogger.info(
        "Bootstrapping mailer service...",
      );
  
    // START ALL CONSUMERS IN PARALLEL
    await Promise.all([
      consumeVerificationEmail(),
      consumeForgotPasswordEmail(),
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