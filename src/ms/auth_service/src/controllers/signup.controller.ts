import { Request, Response } from "express";
import { signupService } from "@services/signup.service";
import { sendResponse } from "@utils/api_response";
import { logger } from "@utils/logger";

/**
 * @controller signupController
 * Handles incoming signup requests.
 * Delegates validation and user creation to signupService.
 * Responsible only for managing Express response and cookies.
 */
export const signupController = async (req: Request, res: Response) => {
  try {
    // Remove sensitive fields like password before logging
    const safeBodyKeys = Object.keys(req.body || {}).filter(
      (k) => !["password", "confirmPassword"].includes(k.toLowerCase())
    );

    // Log incoming request metadata
    logger.info({
      message: "🟢 [SIGNUP] Incoming request",
      bodyKeys: safeBodyKeys,
      ip: req.ip,
      path: req.path,
    });

    // Call the service layer
    const result = await signupService(req.body);

    // Set cookies returned from service if any
    if (result.cookies) {
      result.cookies.forEach((cookie) => {
        res.cookie(cookie.name, cookie.value, cookie.options);
      });
    }

    // Send standardized success response
    return sendResponse({
      res,
      success: true,
      message: result.message || "Signup successful",
      statusCode: result.statusCode || 201,
      data: result.data,
      path: req.path,
    });

  } catch (err: any) {
    // Log structured error information
    logger.error({
      context: "[SIGNUP_CONTROLLER]",
      message: err?.message,
      name: err?.name,
      stack: err?.stack?.split("\n")[0],
    }, "❌ [SIGNUP] Error occurred");

    // Handle known service errors (ServiceResponse/ServiceException)
    if (err?.response) {
      return sendResponse({
        res,
        success: false,
        message: err.response.message || "Signup failed",
        statusCode: err.response.statusCode,
        errorType: err.response.errorType,
        errors: err.response.errors,
        path: req.path,
      });
    }

    // Fallback for unexpected errors
    return sendResponse({
      res,
      success: false,
      message: "Something went wrong. Please try again later.",
      statusCode: 500,
      errorType: "internal_server_error",
      path: req.path,
    });
  }
};
