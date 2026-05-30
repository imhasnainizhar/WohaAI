import { verifyJwtToken } from '@utils/jwt';
import { Request, Response } from "express";
import { sendResponse, ServiceException, ServiceResponse } from "@utils/response";
import { safeParse, ZodError } from "zod";
import { logger } from "@utils/logger";
import { env } from '@config/env';

// Services handling respective update logic
import { nameUpdateService } from "@services/name_update";
import { passwordUpdateService } from "@services/password_update";
import { usernameUpdateService } from "@services/username_update";
import { emailUpdateService } from "@services/email_update";
import { usernameUpdateSchema } from '@schemas/username_update';
import { passwordUpdateSchema } from '@schemas/password_update';
import { nameUpdateSchema } from '@schemas/name_update';
import { emailUpdateSchema } from '@schemas/email_update';

/**
 * Controller: Update user's display name
 */
export const nameUpdateController = async (req: Request, res: Response) => {
  try {
    const refreshToken = req.cookies?.[env.JWT_REFRESH_SECRET_KEY]
    const session = verifyJwtToken(refreshToken, env.JWT_REFRESH_SECRET_KEY)

    const userID = session.sub
    if (!userID) {
      return sendResponse({
        res,
        success: false,
        statusCode: 401,
        message: "session expired",
        errorType: "unauthorized"
      })
    }

    const parsed = nameUpdateSchema.safeParse(req.body)
    if (!parsed.success) {
      return sendResponse({
        res,
        success: false,
        statusCode: 410,
        message: "validation error",
        errorType: "validation_error"
      })
    }
    const { firstName, lastName } = parsed.data
    // Attempt to update the user's name via the service layer
    const result = await nameUpdateService({ userID, firstName, lastName });

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

    if (error instanceof ServiceException) {
      logger.warn({ action: "update_name", errors: error }, "Service Exception");
      return sendResponse({
        res,
        ...error.response
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
    const refreshToken = req.cookies?.[env.JWT_REFRESH_SECRET_KEY]
    const session = verifyJwtToken(refreshToken, env.JWT_REFRESH_SECRET_KEY)

    const userID = session.sub
    if (!userID) {
      return sendResponse({
        res,
        success: false,
        statusCode: 401,
        message: "session expired",
        errorType: "unauthorized"
      })
    }

    const parsed = passwordUpdateSchema.safeParse(req.body)
    if (!parsed.success) {
      return sendResponse({
        res,
        success: false,
        statusCode: 410,
        message: "validation error",
        errorType: "validation_error"
      })
    }
    const { newPassword, confirmNewPassword } = parsed.data

    if (newPassword !== confirmNewPassword) {
      return sendResponse({
        res,
        success: false,
        statusCode: 400,
        message: "Password must match confirm password",
        errorType: "validation_error"
      })
    }

    const result = await passwordUpdateService({ userID, newPassword });

    // Send successful structured response
    if (result) {
      // Log successful password update (without exposing sensitive info)
      logger.info({ action: "update_password", user: session.userId }, "Password updated successfully");

      return sendResponse({
        res,
        success: true,
        message: "Password updated successfully",
        statusCode: 200,
        data: result.data,
        path: req.originalUrl,
      });
    }
  } catch (error) {
    if (error instanceof ServiceException) {
      return sendResponse({
        res,
        ...error.response
      })
    }
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
    const refreshToken = req.cookies?.[env.JWT_REFRESH_SECRET_KEY]
    const session = verifyJwtToken(refreshToken, env.JWT_REFRESH_SECRET_KEY)

    const userID = session.sub
    if (!userID) {
      return sendResponse({
        res,
        success: false,
        statusCode: 401,
        message: "session expired",
        errorType: "unauthorized"
      })
    }

    const parsed = usernameUpdateSchema.safeParse(req.body)
    if (!parsed.success) {
      return sendResponse({
        res,
        success: false,
        statusCode: 410,
        message: "validation error",
        errorType: "validation_error"
      })
    }
    const { username } = parsed.data
    // Attempt username update through service
    const result = await usernameUpdateService({ userID, username });

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
    if (error instanceof ServiceException) {
      return sendResponse({
        res,
        ...error.response
      })
    }

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
    const refreshToken = req.cookies?.[env.JWT_REFRESH_SECRET_KEY]
    const session = verifyJwtToken(refreshToken, env.JWT_REFRESH_SECRET_KEY)

    const userID = session.sub
    if (!userID) {
      return sendResponse({
        res,
        success: false,
        statusCode: 401,
        message: "session expired",
        errorType: "unauthorized"
      })
    }

    const parsed = emailUpdateSchema.safeParse(req.body)
    if (!parsed.success) {
      return sendResponse({
        res,
        success: false,
        statusCode: 410,
        message: "validation error",
        errorType: "validation_error"
      })
    }
    const { email } = parsed.data
    const result = await emailUpdateService({ userID, email })
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
    if (error instanceof ServiceException) {
      return sendResponse({
        res,
        ...error.response
      })
    }

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
