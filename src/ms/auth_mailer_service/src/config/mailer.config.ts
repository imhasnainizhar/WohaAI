import 'dotenv/config';
import nodemailer from "nodemailer";
import { logger } from "@utils/logger";
import { env } from "@config/env.config"

export const mailTransporter = nodemailer.createTransport({
  host: env.MAILER_HOST,
  port: Number(env.MAILER_PORT),
  // secure: process.env.MAIL_SECURE === "true", // true for 465, false for other ports
  auth: {
    user: env.MAILER_EMAIL_USER,
    pass: env.MAILER_EMAIL_PASS,
  },
});

// export const mailTransporter = nodemailer.createTransport({
//     host: 'smtp.ethereal.email',
//     port: 587,
//     auth: {
//         user: 'orland86@ethereal.email',
//         pass: '2WvWfWvWRm6nCSXVf3'
//     }
// });

// verify connection
(async () => {
  try {
    await mailTransporter.verify();
    logger.info("✅ Mailer is ready to send messages");
  } catch (error: any) {
    // Log detailed info
    logger.error("🛑 Mailer verification failed", error);

    if (typeof error == "object" && error !== null) {
      logger.error(Object.keys(error))
      logger.error(JSON.stringify(error, null, 2))
    }
  }
})();

