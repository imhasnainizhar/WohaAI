import { Request, Response } from "express";
import { sendResponse } from "@utils/api_response";
import { ZodError } from "zod";
import { logger } from "@utils/logger";

// Services handling respective update logic
import { nameUpdateService } from "@services/name_update.service";
import { passwordUpdateService } from "@services/password_update.service";
import { usernameUpdateService } from "@services/username_update.service";
import { emailUpdateService } from "@services/email_update.service";

/**
 * Controller: Update user's display name
 */
export const nameUpdateController = async (req: Request, res: Response) => {
  try {
    // Attempt to update the user's name via the service layer
    const result = await nameUpdateService(req.body);

    // Log successful update
    logger.info({ action: "update_name", user: req.body.userId }, "User name updated successfully");

    // Send a structured success response
    return sendResponse({
      res,
      success: true,
      message: "User name updated successfully",
      statusCode: 200,
      data: result,
      path: req.originalUrl,
    });
  } catch (error: any) {
    // Handle validation errors from Zod
    if (error instanceof ZodError) {
      logger.warn({ action: "update_name", errors: error.flatten().fieldErrors }, "Validation failed");
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

    // Log unexpected internal errors
    logger.error({ action: "update_name", error }, "Internal server error");
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
 * Controller: Update user's password
 */
export const passwordUpdateController = async (req: Request, res: Response) => {
  try {
    // Delegate password update logic to the service layer
    const result = await passwordUpdateService(req.body);

    // Handle failed responses gracefully based on service feedback
    if (!result.success) {
      logger.warn({ action: "update_password", reason: result.message }, "Password update failed");
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

    // Log successful password update (without exposing sensitive info)
    logger.info({ action: "update_password", user: req.body.userId }, "Password updated successfully");

    // Send successful structured response
    return sendResponse({
      res,
      success: true,
      message: "Password updated successfully",
      statusCode: 200,
      data: result.data,
      path: req.originalUrl,
    });
  } catch (error) {
    // Log internal unexpected errors
    logger.error({ action: "update_password", error }, "Unexpected error while updating password");
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
 * Controller: Update user's username
 */
export const usernameUpdateController = async (req: Request, res: Response) => {
  try {
    // Attempt username update through service
    const result = await usernameUpdateService(req.body);

    // Handle failed cases with structured feedback
    if (!result.success) {
      logger.warn({ action: "update_username", reason: result.message }, "Username update failed");
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

    // Log successful update
    logger.info({ action: "update_username", user: req.body.userId }, "Username updated successfully");

    // Send structured success response
    return sendResponse({
      res,
      success: true,
      message: "Username updated successfully",
      statusCode: 200,
      data: result.data,
      path: req.originalUrl,
    });
  } catch (error: any) {
    // Log internal exceptions
    logger.error({ action: "update_username", error }, "Unexpected error while updating username");
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
 * Controller: Update user's email address
 */
export const emailUpdateController = async (req: Request, res: Response) => {
  try {
    // Perform email update operation via service
    const result = await emailUpdateService(req.body);

    // Handle failed service responses
    if (!result.success) {
      logger.warn({ action: "update_email", reason: result.message }, "Email update failed");
      return sendResponse({
        res,
        success: false,
        message: result.message,
        statusCode: result.statusCode || 400,
        errors: result.errors,
        errorType: result.errorType,
        path: req.originalUrl,
      });
    }

    // Log success event
    logger.info({ action: "update_email", user: req.body.userId }, "Email updated successfully");

    // Send final response back to client
    return sendResponse({
      res,
      success: true,
      message: "Email updated successfully",
      statusCode: 200,
      data: result.data,
      path: req.originalUrl,
    });
  } catch (error: any) {
    // Log unexpected errors
    logger.error({ action: "update_email", error }, "Unexpected error while updating email");
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
