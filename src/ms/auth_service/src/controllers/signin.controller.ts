import { Request, Response } from "express";
import { signinService } from "@services/signin.service";
import { sendResponse } from "@utils/api_response";
import { logger } from "@utils/logger";

/**
 * @controller signinController
 * Handles HTTP layer for user login.
 * Delegates validation & auth logic to signinService.
 */
export const signinController = async (req: Request, res: Response) => {
  try {
    // Log safe body keys without sensitive info like passwords
    const safeBodyKeys = Object.keys(req.body || {}).filter(
      (k) => !["password"].includes(k.toLowerCase())
    );
    logger.info({
      message: "🟢 [SIGNIN] Incoming request",
      bodyKeys: safeBodyKeys,
      ip: req.ip,
    });

    // Call service
    const result = await signinService(req.body);

    // Set cookies if provided
    if (result.cookies) {
      result.cookies.forEach((cookie) => {
        res.cookie(cookie.name, cookie.value, cookie.options);
      });
    }

    // Return structured success response
    return sendResponse({
      res,
      success: true,
      message: result.message,
      statusCode: result.statusCode,
      data: result.data,
      path: req.path,
    });
  } catch (err: any) {
    logger.error(
      {
        context: "[SIGNIN_CONTROLLER]",
        message: err?.message,
        stack: err?.stack?.split("\n")[0],
      },
      "❌ [SIGNIN] Controller error"
    );

    // Normalize all errors to ServiceResponse shape
    return sendResponse({
      res,
      success: false,
      message: err?.message || "Internal server error during signin",
      statusCode: err?.response?.statusCode || err?.statusCode || 500,
      errors: err?.response?.errors || err?.errors,
      errorType: err?.response?.errorType || err?.errorType || "internal_server_error",
      path: req.path,
    });
  }
};
