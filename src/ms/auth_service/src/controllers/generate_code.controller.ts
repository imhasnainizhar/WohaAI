import { env } from "@config/env.config";
import { Request, Response } from "express";
import { generateVerificationCodeService } from "@services/verifications/generate_code.service";
import { logger } from "@utils/logger";
import { getCodeRequestSchema } from "@schemas/code_request.schema";
import { verifyJwtToken } from "@utils/jwt";
import { sendResponse } from "@utils/response";

export const generateVerificationCodeController = async (req: Request, res: Response) => {
  try {
    // Validate request body
    const parsed = getCodeRequestSchema.safeParse(req.body);
    if (!parsed.success) {
      return sendResponse({
        res,
        success: false,
        statusCode: 400,
        message: "Validation failed",
        errors: parsed.error.flatten().fieldErrors,
        path: req.path,
      });
    }

    const token = req.cookies?.[env.SIGNUP_SESSION_TOKEN_NAME!];
    if (!token) {
      return sendResponse({
        res,
        success: false,
        statusCode: 401,
        message: "Signup session expired or missing",
        errorType: "unauthorized",
        path: req.path,
      });
    }

    // Verify signup session token
    let sessionPayload;
    try {
      sessionPayload = verifyJwtToken(token, env.JWT_SIGNUP_SESSION_SECRET_KEY);
    } catch {
      return sendResponse({
        res,
        success: false,
        statusCode: 401,
        message: "Invalid or expired signup session",
        errorType: "unauthorized",
        path: req.path,
      });
    }

    // Extract email + sessionID
    const signupSessionID = sessionPayload.sid ?? sessionPayload.signupSessionID;

    // Generate verification code
    const serviceResult = await generateVerificationCodeService( signupSessionID, req.body?.email );

    // Respond
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
