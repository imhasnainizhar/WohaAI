import { Request, Response } from "express";
import { signupService } from "@services/signup.service";
import { sendResponse } from "@utils/api_response";
import { logger } from "@utils/logger";
import { ServiceResponse } from "@utils/service_response";
import { ServiceException } from "@errors/service_exception";

/**
 * @controller signupController
 * Handles signup HTTP requests.
 * Delegates validation and user creation to signupService.
 * Only manages cookies and HTTP response.
 */
export const signupController = async (req: Request, res: Response) => {
  try {
    // Remove sensitive fields before logging
    const safeBodyKeys = Object.keys(req.body || {}).filter(
      (k) => !["password", "confirmPassword"].includes(k.toLowerCase())
    );

    logger.info({
      message: "🟢 [SIGNUP] Incoming request",
      bodyKeys: safeBodyKeys,
      ip: req.ip,
      path: req.path,
    });

    // Call service layer
    const serviceResult: ServiceResponse<any> = await signupService(req.body);

    // If service returned a failure response, forward it without throwing
    if (!serviceResult.success) {
      logger.warn({
        message: serviceResult.message,
        errors: serviceResult.errors,
        path: req.path
      }, "🔴 [SIGNUP] Service returned failure");

      return sendResponse({
        res,
        success: false,
        message: serviceResult.message,
        statusCode: serviceResult.statusCode,
        errorType: serviceResult.errorType,
        errors: serviceResult.errors,
        path: req.path,
      });
    }

    // Apply cookies returned by service
    if (serviceResult.cookies) {
      serviceResult.cookies.forEach((cookie) => {
        res.cookie(cookie.name, cookie.value, cookie.options);
      });
    }

    // Forward successful response
    return sendResponse({
      res,
      success: true,
      message: serviceResult.message || "Signup successful",
      statusCode: serviceResult.statusCode || 201,
      data: serviceResult.data,
      path: req.path,
    });

  } catch (err: any) {
    // Log unexpected error
    logger.error({
      context: "[SIGNUP_CONTROLLER]",
      message: err?.message,
      stack: err?.stack?.split("\n")[0],
    }, "❌ [SIGNUP] Unexpected error");

    // If it's a ServiceException, forward its response
    if (err instanceof ServiceException) {
      return sendResponse({
        res,
        ...err.response,
        path: req.path,
      });
    }

    // Fallback for truly unexpected errors
    return sendResponse({
      res,
      success: false,
      message: err?.message || "Internal server error",
      statusCode: 500,
      errorType: "internal_server_error",
      path: req.path,
    });
  }
};
