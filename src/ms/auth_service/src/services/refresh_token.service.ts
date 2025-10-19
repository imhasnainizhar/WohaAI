import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import argon2 from "argon2";
import { prisma } from "@utils/prisma_client";
import { sendResponse } from "@utils/api_response";
import { logger } from "@utils/logger";

export async function refreshTokenService(req: Request, res: Response) {
  try {
    const refreshToken = req.cookies?.__woahai_ref_t;

    // User did not send a refresh token
    if (!refreshToken) {
      logger.warn({ path: req.path }, "🔴 [REFRESH] Refresh token missing");
      return sendResponse({
        res,
        success: false,
        message: "Refresh token missing",
        statusCode: 401,
        errorType: "token_missing",
        path: req.path,
      });
    }

    const JWT_REFRESH_SECRET_KEY = process.env.JWT_REFRESH_SECRET_KEY;
    const JWT_ACCESS_SECRET_KEY = process.env.JWT_ACCESS_SECRET_KEY;

    // Internal misconfiguration
    if (!JWT_REFRESH_SECRET_KEY || !JWT_ACCESS_SECRET_KEY) {
      logger.error({ path: req.path }, "❌ [REFRESH] JWT secret keys not configured");
      return sendResponse({
        res,
        success: false,
        message: "Token configuration error",
        statusCode: 500,
        errorType: "config_error",
        path: req.path,
      });
    }

    // Verify refresh token validity
    let payload: any;
    try {
      payload = jwt.verify(refreshToken, JWT_REFRESH_SECRET_KEY);
    } catch {
      logger.warn({ path: req.path }, "⛔ [REFRESH] Invalid refresh token attempt");
      return sendResponse({
        res,
        success: false,
        message: "Invalid refresh token",
        statusCode: 403,
        errorType: "invalid_token",
        path: req.path,
      });
    }

    // Fetch user and check token hash
    const user = await prisma.user.findUnique({
      where: { userID: payload.sub },
    });

    if (!user || !user.refreshTokenHash) {
      logger.warn({ path: req.path, userID: payload.sub }, "⛔ [REFRESH] User not found or token not registered");
      return sendResponse({
        res,
        success: false,
        message: "User not found or token not registered",
        statusCode: 404,
        errorType: "not_found",
        path: req.path,
      });
    }

    const valid = await argon2.verify(user.refreshTokenHash, refreshToken);
    if (!valid) {
      logger.warn({ path: req.path, userID: user.userID }, "⛔ [REFRESH] Refresh token mismatch");
      return sendResponse({
        res,
        success: false,
        message: "Refresh token does not match",
        statusCode: 403,
        errorType: "token_mismatch",
        path: req.path,
      });
    }

    // Issue new tokens
    const newAccessToken = jwt.sign(
      { sub: user.userID, email: user.email, name: `${user.userFirstName} ${user.userLastName}` },
      JWT_ACCESS_SECRET_KEY,
      { expiresIn: "1h" }
    );

    const newRefreshToken = jwt.sign({ sub: user.userID }, JWT_REFRESH_SECRET_KEY, {
      expiresIn: "7d",
    });

    // Rotate refresh token hash
    const newRefreshTokenHash = await argon2.hash(newRefreshToken);
    await prisma.user.update({
      where: { userID: user.userID },
      data: { refreshTokenHash: newRefreshTokenHash },
    });

    const sameSite = process.env.NODE_ENV === "production" ? "none" : "lax";

    // Set secure cookies
    res.cookie("__woahai_acc_t", newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite,
      path: "/",
      maxAge: 1000 * 60 * 60,
    });

    res.cookie("__woahai_ref_t", newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite,
      path: "/",
      maxAge: 1000 * 60 * 60 * 24 * 7,
    });

    logger.info({ userID: user.userID, path: req.path }, "🟢 [REFRESH] Tokens refreshed successfully");

    return sendResponse({
      res,
      success: true,
      message: "Tokens refreshed successfully",
      statusCode: 200,
      data: { userID: user.userID, email: user.email },
      path: req.path,
    });
  } catch (err: any) {
    // Unexpected internal error
    logger.error({ path: req.path, error: err.message }, "❌ [REFRESH] Internal server error");
    return sendResponse({
      res,
      success: false,
      message: "Internal server error",
      statusCode: 500,
      errorType: "internal_error",
      path: req.path,
    });
  }
}
