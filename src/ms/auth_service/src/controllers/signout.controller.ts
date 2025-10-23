import { Request, Response } from "express";
import { signoutService } from "@services/signout.service";
import { sendResponse } from "@utils/response";
import { logger } from "@utils/logger";
import { env } from "@config/env.config";
import { verifyJwtToken } from "@utils/jwt";

/**
 * @controller signoutController
 * Handles incoming signout requests.
 * - Extracts user ID and session ID from refresh token
 * - Calls signoutService to revoke the specific session
 * - Clears cookies and returns standardized API response
 */
export const signoutController = async (req: Request, res: Response) => {
  try {
    // Extract token from cookies
    const token = req.cookies?.[env.REFRESH_TOKEN_NAME];
    if (!token) {
      logger.warn(`🚫 [SIGNOUT] No refresh token provided in cookies. Path: ${req.path}`);
      return sendResponse({
        res,
        success: false,
        statusCode: 401,
        message: "No refresh token provided.",
        errorType: "unauthorized",
        path: req.path,
      });
    }

    // Verify token and extract payload
    let payload: any;
    try {
      payload = verifyJwtToken(token, env.JWT_REFRESH_SECRET_KEY);
    } catch (verifyErr) {
      logger.warn({
        message: `🚫 [SIGNOUT] Failed to verify refresh token.`,
        error: verifyErr,
        path: req.path,
      });
      return sendResponse({
        res,
        success: false,
        statusCode: 401,
        message: "Invalid or expired refresh token.",
        errorType: "unauthorized",
        path: req.path,
      });
    }

    const { sub: userID, userSessionID } = payload;

    if (!userID || !userSessionID) {
      logger.warn(`🚫 [SIGNOUT] Missing userID or sessionID in token payload.`);
      return sendResponse({
        res,
        success: false,
        statusCode: 401,
        message: "Session expired.",
        errorType: "unauthorized",
        path: req.path,
      });
    }

    // Call signout service with safe try/catch
    let serviceResult;
    try {
      serviceResult = await signoutService(userID, userSessionID);
      if (!serviceResult || typeof serviceResult !== "object") {
        logger.error({
          message: "[SIGNOUT] Invalid service response from signoutService",
          userID,
          userSessionID,
        });
        throw new Error("Invalid service response.");
      }
    } catch (serviceErr: any) {
      logger.error({
        message: `[SIGNOUT] signoutService failed for user ${userID}`,
        error: serviceErr?.message || serviceErr,
        userID,
        userSessionID,
        path: req.path,
      });

      return sendResponse({
        res,
        success: false,
        statusCode: serviceErr?.statusCode || 500,
        message: serviceErr?.message || "Failed to sign out user.",
        errorType: serviceErr?.errorType || "internal_server_error",
        path: req.path,
      });
    }

    // Clear cookies safely
    try {
      const cookieOptions = {
        httpOnly: true,
        secure: env.SECURE_COOKIE_OPTION,
        sameSite: env.SAME_SITE_COOKIE_OPTION,
      };
      res.clearCookie(env.ACCESS_TOKEN_NAME, cookieOptions);
      res.clearCookie(env.REFRESH_TOKEN_NAME, cookieOptions);
      res.clearCookie(env.PRIVATE_ACCESS_TOKEN_NAME, cookieOptions);
    } catch (cookieErr) {
      logger.warn({
        message: `[SIGNOUT] Failed to clear cookies for user ${userID}`,
        error: cookieErr,
        path: req.path,
      });
    }

    logger.info(`✅ [SIGNOUT] User ${userID} signed out successfully. Path: ${req.path}`);

    // Return service response safely
    return sendResponse({
      res,
      ...serviceResult, // spreads { success, statusCode, message, data }
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
