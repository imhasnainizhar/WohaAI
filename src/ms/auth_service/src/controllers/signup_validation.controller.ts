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
import { env } from "@config/env.config";

const TOKEN_COOKIE_NAME = "signup_token";
const TOKEN_TTL_SECONDS = 1800; // 30 minutes

const sameSite = (env.NODE_ENV === "production" ? "none" : "lax") as
  "none" | "lax" | "strict";


/**
 * Step 1: Validate username and set Redis token in HTTP-only cookie
 */
export const validateUsernameController = async (req: Request, res: Response) => {
  try {
    const { username } = req.body;

    const result = await validateUsername(username);

    // Set token in HTTP-only secure cookie
    res.cookie(TOKEN_COOKIE_NAME, result.data?.token, {
      httpOnly: true,
      secure: true, 
      sameSite: sameSite,
      maxAge: TOKEN_TTL_SECONDS * 1000,
    });

    return sendResponse({
      res,
      success: true,
      message: result.message,
      statusCode: result.statusCode,
      data: null, // token is now in cookie, not in response body
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
 * Step 2: Validate display name
 */
export const validateDisplayNameController = async (req: Request, res: Response) => {
  try {
    const token = req.cookies[TOKEN_COOKIE_NAME];
    const { firstName, lastName, username } = req.body;

    if (!token) {
      sendResponse({
        res,
        success: false,
        message: "Missing signup token.",
        statusCode: 400,
        errorType: "validation_error",
      })
    }

    const result = await validateDisplayName(token, firstName, lastName, username);

    // Refresh cookie TTL
    res.cookie(TOKEN_COOKIE_NAME, token, {
      httpOnly: true,
      secure: true,
      sameSite: sameSite,
      maxAge: TOKEN_TTL_SECONDS * 1000,
    });

    return sendResponse({
      res,
      success: true,
      message: result.message,
      statusCode: result.statusCode,
      data: null,
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
 * Step 3: Validate email
 */
export const validateEmailController = async (req: Request, res: Response) => {
  try {
    const token = req.cookies[TOKEN_COOKIE_NAME];
    const { email, firstName, lastName, username } = req.body;

    if (!token) {
      return sendResponse({
        res,
        success: false,
        message: "Missing signup token.",
        statusCode: 400,
        errorType: "validation_error",
      })
    }

    const result = await validateEmail(token, email, firstName, lastName, username);

    // Refresh cookie TTL
    res.cookie(TOKEN_COOKIE_NAME, token, {
      httpOnly: true,
      secure: true,
      sameSite: sameSite,
      maxAge: TOKEN_TTL_SECONDS * 1000,
    });

    return sendResponse({
      res,
      success: true,
      message: result.message,
      statusCode: result.statusCode,
      data: null,
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
 * Step 4: Validate password
 */
export const validatePasswordController = async (req: Request, res: Response) => {
  try {
    const token = req.cookies[TOKEN_COOKIE_NAME];
    const { password, confirmPassword, email, firstName, lastName, username } = req.body;

    if (!token) {
      sendResponse({
        res,
        success: false,
        message: "Missing signup token.",
        statusCode: 400,
        errorType: "validation_error",
      })
    }

    const result = await validatePassword(token, password, confirmPassword, email, firstName, lastName, username);

    // Optionally, invalidate the token after final step
    res.clearCookie(TOKEN_COOKIE_NAME);

    return sendResponse({
      res,
      success: true,
      message: result.message,
      statusCode: result.statusCode,
      data: null,
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
