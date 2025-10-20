import { Request, Response } from "express";
import { signoutService } from "@services/signout.service";
import { sendResponse } from "@utils/api_response";
import { logger } from "@utils/logger";

/**
 * @controller signoutController
 * Handles incoming signout requests.
 * - Extracts user ID from request (req.body.userID)
 * - Calls signoutService to revoke tokens
 * - Returns standardized API response via sendResponse
 */
export const signoutController = async (req: Request, res: Response) => {
  try {
    const userID = req.body?.userID;

    if (!userID) {
      logger.warn("🚫 [SIGNOUT] Missing user ID in request.");
      return sendResponse({
        res,
        success: false,
        statusCode: 401,
        message: "Unauthorized. User not identified.",
        errorType: "unauthorized",
        path: req.path,
      });
    }

    // Call signout service
    const serviceResult = await signoutService(userID);

    // Clear auth cookies (optional but recommended)
    res.clearCookie("accessToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    logger.info(`✅ [SIGNOUT] User ${userID} signed out successfully.`);

    return sendResponse({
      res,
      ...serviceResult, // spreads { success, statusCode, message, data } from your service
      path: req.path,
    });
  } catch (err: any) {
    logger.error({
      message: "❌ [SIGNOUT_CONTROLLER] Unhandled error",
      error: err?.message || err,
      path: req.path,
    });

    return sendResponse({
      res,
      success: false,
      statusCode: 500,
      message: "Failed to sign out.",
      errorType: "internal_server_error",
      path: req.path,
    });
  }
};
