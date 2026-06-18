import nodemailer from "nodemailer";
import { env } from "@wohaai/env-ts";

export const mailerTransport = nodemailer.createTransport({
  host: env.MAILER_HOST,
  port: Number(env.MAILER_PORT),
  secure: false,

  auth: {
    user: env.MAILER_USER_EMAIL,
    pass: env.MAILER_USER_PASSWORD,
  },
});