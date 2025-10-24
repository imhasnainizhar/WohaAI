import { confirmUserEmailService } from './../services/signup/signup.service';
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
import { verifyUserEmailSchema } from '@schemas/email_verification.schema';

/**
 * Validate display name
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

    const result = await validateDisplayNameService(signupSessionID, username, firstName, lastName);

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
 * Validate email
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

    const result = await validateEmailService(signupSessionID, username, email, firstName, lastName);


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

export const confirmUserEmailController = async (req: Request, res: Response) => {

  try {
    const parsed = verifyUserEmailSchema.safeParse(req.body);

    if (!parsed.success) {
      return sendResponse({
        res,
        success: false,
        statusCode: 400,
        message: "Invalid data",
        errors: parsed.error.flatten().fieldErrors,
        errorType: "validation_error",
      });
    }

    const { email, verificationCode } = parsed.data;
    const token = req.cookies?.[env.SIGNUP_SESSION_TOKEN_NAME]
    const payload = verifyJwtToken(token, env.JWT_SIGNUP_SESSION_SECRET_KEY)
    const signupSessionID = payload.signupSessionID

    const result = await confirmUserEmailService(
      verificationCode,
      signupSessionID,
      email
    );

    return sendResponse({
      res,
      ...result,
    });
  } catch (error: any) {
    if (error instanceof ServiceException) {
      return sendResponse({ res, ...error.response });
    }

    logger.error("❌ Unexpected error in confirmUserEmailController:", error);

    return sendResponse({
      res,
      success: false,
      statusCode: 500,
      message: "Unexpected server error",
      errorType: "internal_server_error",
    });

  }
}

/**
 * Validate password
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

    const result = await validatePasswordService(signupSessionID, username, email, password, confirmPassword, firstName, lastName,  );

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
