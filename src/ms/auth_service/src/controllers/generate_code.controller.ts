import { Request, Response } from "express";
import { generateVerificationCodeService } from "@services/generate_code.service";
import { logger } from "@utils/logger";
import { sendResponse } from "@utils/api_response";
import { emailSchema } from "@schemas/signup_validation.schema";

export const generateVerificationCodeController = async (req: Request, res: Response) => {
  try {
    const body = req.body;

    // Validate email input
    const parsed = emailSchema.safeParse(body);
    if (!parsed.success) {
      return sendResponse({
        res,
        success: false,
        statusCode: 400,
        message: "Validation failed",
        errors: {
          email: ["Invalid email format"],
        },
        path: req.path,
      });
    }

    const email = parsed.data.email;

    // Call service to generate verification code
    const serviceResult = await generateVerificationCodeService(email);

    // Return service response
    return sendResponse({
      res,
      ...serviceResult,
      path: req.path,
    });
  } catch (err: any) {
    logger.error("❌ generateVerificationCodeController error:", err);

    return sendResponse({
      res,
      success: false,
      statusCode: 500,
      message: "Failed to generate verification code",
      errorType: "internal_server_error",
      path: req.path,
    });
  }
};
