import { Request, Response } from "express";
import { sendResponse } from "@utils/api_response";
import { MailerService } from "@services/mailer.service";
import { logger } from "@utils/logger"; // optional logging util

export class MailerController {
  static async sendVerification(req: Request, res: Response) {
    try {
      const { email, code } = req.body;

      if (!email || !code) {
        return sendResponse({
          res,
          success: false,
          statusCode: 400,
          message: "Email and code are required",
          errors: { body: ["Missing required fields"] },
          errorType: "validation_error",
        });
      }

      const response = await MailerService.sendVerificationCode(email, code);

      return sendResponse({ res, ...response });
    } catch (err: any) {
      logger.error("🛑 Mail verification failed", err);
      if (err.response) {
        return sendResponse({ res, ...err.response });
      }
      return sendResponse({ res, success: false, message: "Unexpected error occurred" });
    }
  }

  static async sendPasswordReset(req: Request, res: Response) {
    try {
      const { email, link } = req.body;

      if (!email || !link) {
        return sendResponse({
          res,
          success: false,
          statusCode: 400,
          message: "Email and reset link are required",
          errors: { body: ["Missing required fields"] },
          errorType: "validation_error",
        });
      }

      const response = await MailerService.sendPasswordReset(email, link);

      return sendResponse({ res, ...response });
    } catch (err: any) {
      logger.error("🛑 Password reset email failed", err);
      if (err.response) {
        return sendResponse({ res, ...err.response });
      }
      return sendResponse({ res, success: false, message: "Unexpected error occurred" });
    }
  }
}
