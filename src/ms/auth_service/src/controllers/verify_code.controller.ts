import { Request, Response } from "express";
import { generateVerificationCodeService } from "@services/verifications/generate_code.service";
import { sendResponse } from "@utils/response";
import { logger } from "@utils/logger";
import { z } from "zod";

// Zod schema for request body validation
const verifyCodeSchema = z.object({
  verificationCode: z
    .number("Verification code must be a number")
    .int()
    .min(100000, "Verification code must be 6 digits")
    .max(999999, "Verification code must be 6 digits"),
  signupSessionId: z.string().nonempty("Signup session ID is required"),
});

export const verifyCodeController = async (req: Request, res: Response) => {
  try {
    // Validate request body
    const parsed = verifyCodeSchema.safeParse(req.body);

    if (!parsed.success) {
      const formattedErrors: Record<string, string[]> = {};
      parsed.error.issues.forEach((err) => {
        if (!err.path[0]) return;
        const key = err.path[0] as string;
        formattedErrors[key] = formattedErrors[key] || [];
        formattedErrors[key].push(err.message);
      });

      return sendResponse({
        res,
        success: false,
        statusCode: 400,
        message: "Validation failed",
        errors: formattedErrors,
        path: req.path,
      });
    }

    const { verificationCode, signupSessionId } = parsed.data;
    const code = verificationCode.toString()

    // Call service
    const serviceResult = await generateVerificationCodeService(code, signupSessionId);

    // Return service response
    return sendResponse({
      res,
      ...serviceResult,
      path: req.path,
    });
  } catch (err: any) {
    logger.error("❌ verifyCodeController error:", err);

    // Fallback error response
    return sendResponse({
      res,
      success: false,
      statusCode: 500,
      message: "Failed to verify code",
      errorType: "internal_server_error",
      path: req.path,
    });
  }
};
