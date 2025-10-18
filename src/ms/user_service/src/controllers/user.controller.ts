import { Request, Response } from "express";
import { sendResponse } from "@utils/api_response";
import { ZodError } from "zod";

// Services
import { nameUpdateService } from "@services/name_update.service";
import { passwordUpdateService } from "@services/password_update.service";
import { usernameUpdateService } from "@services/username_update.service";
import { emailUpdateService } from "@services/email_update.service";

/**
 * Update user's display name
 */
export const nameUpdateController = async (req: Request, res: Response) => {
  try {
    const result = await nameUpdateService(req.body);
    return sendResponse({
      res,
      success: true,
      message: "User name updated successfully",
      statusCode: 200,
      data: result,
      path: req.originalUrl,
    });
  } catch (error: any) {
    if (error instanceof ZodError) {
      return sendResponse({
        res,
        success: false,
        message: "Validation failed",
        statusCode: 400,
        errors: error.flatten().fieldErrors,
        errorType: "validation_error",
        path: req.originalUrl,
      });
    }
    return sendResponse({
      res,
      success: false,
      message: error.message || "Internal server error",
      statusCode: 500,
      errorType: "internal_server_error",
      path: req.originalUrl,
    });
  }
};

/**
 * Update user's password
 */
export const passwordUpdateController = async (req: Request, res: Response) => {
  try {
    const result = await passwordUpdateService(req.body);

    if (!result.success) {
      return sendResponse({
        res,
        success: false,
        message: result.message,
        statusCode: result.statusCode || 400,
        errors: result.errors,
        errorType:
          result.statusCode === 400
            ? "validation_error"
            : result.statusCode === 404
              ? "not_found"
              : "service_error",
        path: req.originalUrl,
      });
    }

    return sendResponse({
      res,
      success: true,
      message: "Password updated successfully",
      statusCode: 200,
      data: result.data,
      path: req.originalUrl,
    });
  } catch (error) {
    console.error("Controller error:", error);
    return sendResponse({
      res,
      success: false,
      message: "Unexpected error while updating password",
      statusCode: 500,
      errorType: "internal_server_error",
      path: req.originalUrl,
    });
  }
};

/**
 * Update user's username
 */
export const usernameUpdateController = async (req: Request, res: Response) => {
  try {
    const result = await usernameUpdateService(req.body);

    if (!result.success) {
      return sendResponse({
        res,
        success: false,
        message: result.message,
        statusCode: result.statusCode || 400,
        errors: result.errors,
        errorType:
          result.statusCode === 400
            ? "validation_error"
            : result.statusCode === 404
              ? "not_found"
              : "service_error",
        path: req.originalUrl,
      });
    }

    return sendResponse({
      res,
      success: true,
      message: "Username updated successfully",
      statusCode: 200,
      data: result.data,
      path: req.originalUrl,
    });
  } catch (error: any) {
    console.error("Controller error:", error);
    return sendResponse({
      res,
      success: false,
      message: error.message || "Unexpected error while updating username",
      statusCode: 500,
      errorType: "internal_server_error",
      path: req.originalUrl,
    });
  }
};

/**
 * Update user's email address
 */
export const emailUpdateController = async (req: Request, res: Response) => {
  try {
    const result = await emailUpdateService(req.body);

    if (!result.success) {
      return sendResponse({
        res,
        success: false,
        message: result.message,
        statusCode: result.statusCode || 400,
        errors: result.errors,
        errorType:
          result.statusCode === 400
            ? "validation_error"
            : result.statusCode === 404
              ? "not_found"
              : "service_error",
        path: req.originalUrl,
      });
    }

    return sendResponse({
      res,
      success: true,
      message: "Email updated successfully",
      statusCode: 200,
      data: result.data,
      path: req.originalUrl,
    });
  } catch (error: any) {
    console.error("Controller error:", error);
    return sendResponse({
      res,
      success: false,
      message: error.message || "Unexpected error while updating email",
      statusCode: 500,
      errorType: "internal_server_error",
      path: req.originalUrl,
    });
  }
};
