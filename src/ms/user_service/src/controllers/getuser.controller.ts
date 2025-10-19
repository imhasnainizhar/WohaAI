import { Request, Response } from "express";
import { z, ZodError } from "zod";
import { sendResponse } from "@utils/api_response";
import {
  getUserByIdService,
  getUserByUsernameService,
  UserNotFoundError,
  InvalidInputError,
} from "@services/getuser.service";
import { logger } from "@utils/logger";

// Zod schemas for validating route parameters before hitting the service layer
const idParamsSchema = z.object({
  id: z.string().uuid({ message: "Invalid user ID format" }),
});

const usernameParamsSchema = z.object({
  username: z.string().min(1, "Username is required"),
});

/**
 * Controller: Get user by ID
 */
export const getUserByIdController = async (req: Request, res: Response) => {
  const path = req.path;

  try {
    // 🟢 Log incoming request
    logger.info({ message: "🟢 [USER] Incoming get user by ID request", path });

    // Validate and extract user ID
    const { id } = idParamsSchema.parse(req.params);

    // 🟣 Debug log for development insights
    logger.debug({ message: "🟣 [USER] Validated user ID parameter", id, path });

    // Fetch user data from service layer
    const user = await getUserByIdService(id);

    // ✅ Log success
    logger.info({ message: "✅ [USER] User retrieved successfully by ID", userId: id, path });

    // Send structured success response
    return sendResponse({
      res,
      success: true,
      message: "User retrieved successfully",
      statusCode: 200,
      data: user,
      path,
    });
  } catch (err: unknown) {
    // ❌ Zod validation error
    if (err instanceof ZodError) {
      logger.warn({ message: "⚠️ [USER] Validation failed in getUserByIdController", path, issues: err.issues });

      const fieldErrors: Record<string, string[]> = {};
      err.issues.forEach((issue) => {
        const field = issue.path.join(".") || "unknown";
        if (!fieldErrors[field]) fieldErrors[field] = [];
        fieldErrors[field].push(issue.message);
      });

      return sendResponse({
        res,
        success: false,
        message: "Invalid request parameters",
        statusCode: 400,
        errors: fieldErrors,
        errorType: "validation_error",
        path,
      });
    }

    // ⚠️ Domain-specific invalid input error
    if (err instanceof InvalidInputError) {
      logger.warn({ message: "⚠️ [USER] Invalid input in getUserByIdController", path, error: err.message });
      return sendResponse({
        res,
        success: false,
        message: err.message,
        statusCode: 400,
        errorType: "invalid_input",
        path,
      });
    }

    // 🔴 User not found error
    if (err instanceof UserNotFoundError) {
      logger.warn({ message: "🔴 [USER] User not found in getUserByIdController", path, error: err.message });
      return sendResponse({
        res,
        success: false,
        message: err.message,
        statusCode: 404,
        errorType: "not_found",
        path,
      });
    }

    // ❌ General JS Error
    if (err instanceof Error) {
      logger.error({ message: "❌ [USER] Unhandled error in getUserByIdController", path, error: err.message });
      return sendResponse({
        res,
        success: false,
        message: err.message || "Internal Server Error",
        statusCode: 500,
        errorType: "internal_server_error",
        path,
      });
    }

    // 🔴 Unknown thrown value
    logger.error({ message: "🔴 [USER] Unknown error type in getUserByIdController", path, error: err });
    return sendResponse({
      res,
      success: false,
      message: "Something went wrong",
      statusCode: 500,
      errorType: "internal_server_error",
      path,
    });
  }
};

/**
 * Controller: Get user by username
 */
export const getUserByUsernameController = async (req: Request, res: Response) => {
  const path = req.path;

  try {
    // 🟢 Log incoming request
    logger.info({ message: "🟢 [USER] Incoming get user by username request", path });

    // Validate and extract username
    const { username } = usernameParamsSchema.parse(req.params);

    // 🟣 Debug log
    logger.debug({ message: "🟣 [USER] Validated username parameter", username, path });

    // Fetch user by username
    const user = await getUserByUsernameService(username);

    // ✅ Log success
    logger.info({ message: "✅ [USER] User retrieved successfully by username", username, path });

    // Respond with data
    return sendResponse({
      res,
      success: true,
      message: "User retrieved successfully",
      statusCode: 200,
      data: user,
      path,
    });
  } catch (err: unknown) {
    // ❌ Validation error
    if (err instanceof ZodError) {
      logger.warn({ message: "⚠️ [USER] Validation failed in getUserByUsernameController", path, issues: err.issues });

      const fieldErrors: Record<string, string[]> = {};
      err.issues.forEach((issue) => {
        const field = issue.path.join(".") || "unknown";
        if (!fieldErrors[field]) fieldErrors[field] = [];
        fieldErrors[field].push(issue.message);
      });

      return sendResponse({
        res,
        success: false,
        message: "Invalid request parameters",
        statusCode: 400,
        errors: fieldErrors,
        errorType: "validation_error",
        path,
      });
    }

    // ⚠️ Invalid input
    if (err instanceof InvalidInputError) {
      logger.warn({ message: "⚠️ [USER] Invalid input in getUserByUsernameController", path, error: err.message });
      return sendResponse({
        res,
        success: false,
        message: err.message,
        statusCode: 400,
        errorType: "invalid_input",
        path,
      });
    }

    // ⛔ User not found
    if (err instanceof UserNotFoundError) {
      logger.warn({ message: "⛔ [USER] User not found in getUserByUsernameController", path, error: err.message });
      return sendResponse({
        res,
        success: false,
        message: err.message,
        statusCode: 404,
        errorType: "not_found",
        path,
      });
    }

    // 🔴 General JS error
    if (err instanceof Error) {
      logger.error({ message: "🔴 [USER] Unhandled error in getUserByUsernameController", path, error: err.message });
      return sendResponse({
        res,
        success: false,
        message: err.message || "Internal Server Error",
        statusCode: 500,
        errorType: "internal_server_error",
        path,
      });
    }

    // ❌ Unknown error type
    logger.error({ message: "❌ [USER] Unknown error type in getUserByUsernameController", path, error: err });
    return sendResponse({
      res,
      success: false,
      message: "Something went wrong",
      statusCode: 500,
      errorType: "internal_server_error",
      path,
    });
  }
};
  