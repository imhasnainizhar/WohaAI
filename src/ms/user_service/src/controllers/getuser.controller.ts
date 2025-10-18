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



// Zod validation schemas
const idParamsSchema = z.object({
  id: z.string().uuid({ message: "Invalid user ID format" }),
});

const usernameParamsSchema = z.object({
  username: z.string().min(1, "Username is required"),
});



// Controller: Get user by ID
export const getUserByIdController = async (req: Request, res: Response) => {
  const path = req.originalUrl;

  try {
    const { id } = idParamsSchema.parse(req.params);
    const user = await getUserByIdService(id);

    return sendResponse({
      res,
      success: true,
      message: "User retrieved successfully",
      statusCode: 200,
      data: user,
      path,
    });
  } catch (err: unknown) {
    // Zod validation errors
    if (err instanceof ZodError) {
      logger.warn({ err, path }, "Validation failed in getUserController");

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

    // Domain-specific errors
    if (err instanceof InvalidInputError) {
      return sendResponse({
        res,
        success: false,
        message: err.message,
        statusCode: 400,
        errorType: "invalid_input",
        path,
      });
    }

    if (err instanceof UserNotFoundError) {
      return sendResponse({
        res,
        success: false,
        message: err.message,
        statusCode: 404,
        errorType: "not_found",
        path,
      });
    }

    // Standard JS Error
    if (err instanceof Error) {
      logger.error({ err, path }, "Unhandled error in getUserController");
      return sendResponse({
        res,
        success: false,
        message: err.message || "Internal Server Error",
        statusCode: 500,
        errorType: "internal_server_error",
        path,
      });
    }

    // Fallback for non-Error thrown values
    logger.error({ err, path }, "Unknown error type in getUserController");
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

// Controller: Get user by username
export const getUserByUsernameController = async (req: Request, res: Response) => {
  const path = req.originalUrl;

  try {
    const { username } = usernameParamsSchema.parse(req.params);
    const user = await getUserByUsernameService(username);

    return sendResponse({
      res,
      success: true,
      message: "User retrieved successfully",
      statusCode: 200,
      data: user,
      path,
    });
  } catch (err: unknown) {
    // Zod validation errors
    if (err instanceof ZodError) {
      logger.warn({ err, path }, "Validation failed in getUserByUsernameController");

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

    // Domain-specific errors
    if (err instanceof InvalidInputError) {
      return sendResponse({
        res,
        success: false,
        message: err.message,
        statusCode: 400,
        errorType: "invalid_input",
        path,
      });
    }

    if (err instanceof UserNotFoundError) {
      return sendResponse({
        res,
        success: false,
        message: err.message,
        statusCode: 404,
        errorType: "not_found",
        path,
      });
    }

    // Standard JS Error
    if (err instanceof Error) {
      logger.error({ err, path }, "Unhandled error in getUserByUsernameController");
      return sendResponse({
        res,
        success: false,
        message: err.message || "Internal Server Error",
        statusCode: 500,
        errorType: "internal_server_error",
        path,
      });
    }

    // Fallback for non-Error thrown values
    logger.error({ err, path }, "Unknown error type in getUserByUsernameController");
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
