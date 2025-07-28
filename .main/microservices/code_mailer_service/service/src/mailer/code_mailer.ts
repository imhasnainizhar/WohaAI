import nodemailer from 'nodemailer';
import process from "process"

export const CodeTransporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export async function sendVerificationEmail(email: string, code: string) {
  await CodeTransporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: email,
    subject: 'Verify Your Email',
    html: `<p>Your verification code is <b>${code}</b></p>`,
  });
}
