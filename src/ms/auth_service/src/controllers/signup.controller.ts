import { signupInitService } from '@services/signup/signup_init.service';
import { Request, Response } from "express";
import { sendResponse, ServiceException } from "@utils/response";
import {
  validateDisplayNameService,
  validateEmailService,
  validatePasswordService,
} from "@services/signup/signup.service";
import { logger } from "@utils/logger";
import { env } from '@config/env.config';
import { verifyJwtToken } from '@utils/jwt';

/**
 * Step 1: Validate username and set Redis token in HTTP-only cookie
 */
export const validateUsernameController = async (req: Request, res: Response) => {
  try {
    const { username } = req.body;

    const result = await signupInitService(username);

    // Set token in HTTP-only secure cookie
    return sendResponse({
      res,
      success: true,
      message: result.message,
      statusCode: result.statusCode,
      data: null, // token is now in cookie, not in response body
      cookies: [

      ]
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
    const token = req.cookies[env.SIGNUP_SESSION_TOKEN_NAME];
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

    const payload = verifyJwtToken(token, env.JWT_SIGNUP_SESSION_SECRET_KEY)
    const signupSessionID = payload.signupSessionID

    const result = await validateDisplayNameService(signupSessionID, firstName, lastName, username);

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
    const token = req.cookies[env.SIGNUP_SESSION_TOKEN_NAME];
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

    const payload = verifyJwtToken(token, env.JWT_SIGNUP_SESSION_SECRET_KEY)
    const signupSessionID = payload.signupSessionID

    const result = await validateEmailService(signupSessionID, email, firstName, lastName, username);


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
    const token = req.cookies[env.SIGNUP_SESSION_TOKEN_NAME];
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

    const payload = verifyJwtToken(token, env.JWT_SIGNUP_SESSION_SECRET_KEY)
    const signupSessionID = payload.signupSessionID

    const result = await validatePasswordService(signupSessionID, password, confirmPassword, email, firstName, lastName, username);

    return sendResponse({
      res,
      ...result
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
