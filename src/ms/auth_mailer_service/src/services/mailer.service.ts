import { ServiceResponse } from "@utils/service_response";
import { ServiceException } from "@errors/service_exception";
import { mailTransporter } from "@config/mailer.config";
import { env } from "@config/env.config";

interface MailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export class MailerService {
  // Send a single email
  static async sendMail(options: MailOptions) {
    try {
      const info = await mailTransporter.sendMail({
        from: `"NoReply" <${env.MAILER_EMAIL_FROM}>`,
        to: options.to,
        subject: options.subject,
        text: options.text,
        html: options.html,
      });

      return ServiceResponse.success({
        success: true,
        statusCode: 200,
        message: `Email sent successfully to ${options.to}`,
        data: { messageId: info.messageId, envelope: info.envelope },
      });
    } catch (err: any) {
      throw new ServiceException(
        ServiceResponse.error({
          success: false,
          statusCode: 500,
          message: "Failed to send email",
          errorType: "mailer_error",
          errors: { mail: [err.message] },
        })
      );
    }
  }

  // Send verification code email
  static async sendVerificationCode(to: string, code: string) {
    const html = `
      <p>Hello,</p>
      <p>Your verification code is: <strong>${code}</strong></p>
      <p>This code will expire in 10 minutes.</p>
    `;

    return this.sendMail({ to, subject: "Your Verification Code", html });
  }

  // Send password reset email
  static async sendPasswordReset(to: string, resetLink: string) {
    const html = `
      <p>Hello,</p>
      <p>Click the link below to reset your password:</p>
      <a href="${resetLink}">Reset Password</a>
      <p>This link will expire in 1 hour.</p>
    `;

    return this.sendMail({ to, subject: "Password Reset", html });
  }
}
