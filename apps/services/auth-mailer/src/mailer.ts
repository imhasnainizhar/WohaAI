import nodemailer from "nodemailer";
import { env } from "@wohaai/env-ts";
import { authMailerLogger } from "@wohaai/telemetry";

authMailerLogger.debug(
  {
    host: env.MAILER_HOST,
    port: env.MAILER_PORT,
  },
  "Initializing mailer transport",
);

export const mailerTransport = nodemailer.createTransport({
  host: env.MAILER_HOST,
  port: Number(env.MAILER_PORT),
  secure: false,

  auth: {
    user: env.MAILER_USER_EMAIL,
    pass: env.MAILER_USER_PASSWORD,
  },
});

authMailerLogger.debug(
  "Mailer transport initialized successfully",
);