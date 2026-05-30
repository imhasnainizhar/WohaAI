import nodemailer from "nodemailer";
import { envConfigs as env } from "@packages/config";

export const mailerTransport = nodemailer.createTransport({
  host: env.MAILER_HOST,
  port: Number(env.MAILER_PORT),
  secure: false,

  auth: {
    user: env.MAILER_USER_EMAIL,
    pass: env.MAILER_USER_PASSWORD,
  },
});