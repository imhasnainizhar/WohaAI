import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import argon2 from "argon2";
import { prisma } from "@utils/prisma_client";
import { sendResponse } from "@utils/api_response";

export async function refreshTokenService(req: Request, res: Response) {
  try {
    const refreshToken = req.cookies?.__woahai_ref_t;

    if (!refreshToken) {
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

    if (!JWT_REFRESH_SECRET_KEY || !JWT_ACCESS_SECRET_KEY) {
      return sendResponse({
        res,
        success: false,
        message: "Token configuration error",
        statusCode: 500,
        errorType: "config_error",
        path: req.path,
      });
    }

    // Verify refresh token
    let payload: any;
    try {
      payload = jwt.verify(refreshToken, JWT_REFRESH_SECRET_KEY);
    } catch {
      return sendResponse({
        res,
        success: false,
        message: "Invalid refresh token",
        statusCode: 403,
        errorType: "invalid_token",
        path: req.path,
      });
    }

    const user = await prisma.user.findUnique({
      where: { userID: payload.sub },
    });

    if (!user || !user.refreshTokenHash) {
      return sendResponse({
        res,
        success: false,
        message: "User not found or token not registered",
        statusCode: 404,
        errorType: "not_found",
        path: req.path,
      });
    }

    // Validate hash
    const valid = await argon2.verify(user.refreshTokenHash, refreshToken);
    if (!valid) {
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

    // Store new hash (token rotation)
    const newRefreshTokenHash = await argon2.hash(newRefreshToken);
    await prisma.user.update({
      where: { userID: user.userID },
      data: { refreshTokenHash: newRefreshTokenHash },
    });

    // Set cookies
    const sameSite = process.env.NODE_ENV === "production" ? "none" : "lax";

    res.cookie("__woahai_acc_t", newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite,
      path: "/",
      maxAge: 1000 * 60 * 60, // 1 hour
    });

    res.cookie("__woahai_ref_t", newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite,
      path: "/",
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    });

    return sendResponse({
      res,
      success: true,
      message: "Tokens refreshed successfully",
      statusCode: 200,
      data: { userID: user.userID, email: user.email },
      path: req.path,
    });
  } catch (err: any) {
    console.error("❌ [REFRESH] Error:", err.message);

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
