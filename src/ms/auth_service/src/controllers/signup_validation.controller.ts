import { Request, Response } from "express";
import { sendResponse } from "@utils/api_response";
import {
  validateUsername,
  validateDisplayName,
  validateEmail,
  validatePassword,
} from "@services/validators/signup_validation.service";
import { ServiceException } from "@errors/service_exception";
import { logger } from "@utils/logger";

/**
 * Validate username availability
 */
export const validateUsernameController = async (req: Request, res: Response) => {
  try {
    const { username } = req.body;

    const result = await validateUsername(username);
    return sendResponse({
      res,
      success: true,
      message: result.message,
      statusCode: result.statusCode,
      data: result.data,
    });
  } catch (err: any) {
    if (err instanceof ServiceException) {
      return sendResponse({ res, ...err.response });
    }

    logger.error({ message: "Unexpected error in validateUsername", error: err });
    return sendResponse({
      res,
      success: false,
      message: "Internal server error.",
      statusCode: 500,
      errorType: "internal_server_error",
    });
  }
};

/**
 * Validate display name format
 */
export const validateDisplayNameController = (req: Request, res: Response) => {
  try {
    const { displayName } = req.body;

    const result = validateDisplayName(displayName);
    return sendResponse({
      res,
      success: true,
      message: result.message,
      statusCode: result.statusCode,
      data: result.data,
    });
  } catch (err: any) {
    if (err instanceof ServiceException) {
      return sendResponse({ res, ...err.response });
    }

    logger.error({ message: "Unexpected error in validateDisplayName", error: err });
    return sendResponse({
      res,
      success: false,
      message: "Internal server error.",
      statusCode: 500,
      errorType: "internal_server_error",
    });
  }
};

/**
 * Validate email format and availability
 */
export const validateEmailController = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    const result = await validateEmail(email);
    return sendResponse({
      res,
      success: true,
      message: result.message,
      statusCode: result.statusCode,
      data: result.data,
    });
  } catch (err: any) {
    if (err instanceof ServiceException) {
      return sendResponse({ res, ...err.response });
    }

    logger.error({ message: "Unexpected error in validateEmail", error: err });
    return sendResponse({
      res,
      success: false,
      message: "Internal server error.",
      statusCode: 500,
      errorType: "internal_server_error",
    });
  }
};

/**
 * Validate password strength
 */
export const validatePasswordController = (req: Request, res: Response) => {
  try {
    const { password } = req.body;

    const result = validatePassword(password);
    return sendResponse({
      res,
      success: true,
      message: result.message,
      statusCode: result.statusCode,
      data: result.data,
    });
  } catch (err: any) {
    if (err instanceof ServiceException) {
      return sendResponse({ res, ...err.response });
    }

    logger.error({ message: "Unexpected error in validatePassword", error: err });
    return sendResponse({
      res,
      success: false,
      message: "Internal server error.",
      statusCode: 500,
      errorType: "internal_server_error",
    });
  }
};
