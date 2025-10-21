import { signupInitService } from '@services/signup/signup_init.service';
import { Request, Response } from "express";
import { sendResponse, ServiceException } from "@utils/response";
import { logger } from "@utils/logger";

/**
 * Step 1: Validate username and set Redis token in HTTP-only cookie
 */
export const signupInitController = async (req: Request, res: Response) => {
  try {
    const { username } = req.body;

    const result = await signupInitService(username);

    // Set token in HTTP-only secure cookie
    return sendResponse({
      res,
      ...result
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