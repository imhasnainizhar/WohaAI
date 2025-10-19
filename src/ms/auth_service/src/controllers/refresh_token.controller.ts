import { Request, Response } from "express";
import { refreshTokenService } from "@services/refresh_token.service";
import { sendResponse } from "@utils/api_response";
import { logger } from "@utils/logger";
import { env } from "@config/env.config";

/**
 * @controller refreshTokenController
 * Handles Express-specific logic for refreshing access tokens.
 */
export const refreshTokenController = async (req: Request, res: Response) => {
    try {
        logger.info({ message: "🟢 [REFRESH] Incoming refresh token request at", path: req.path});

        const refreshToken = req.cookies?.[env.REFRESH_TOKEN_NAME];
        if (!refreshToken) {
            logger.warn({ path: req.path }, "🔴 [REFRESH] Missing refresh token");
            return sendResponse({
                res,
                success: false,
                message: "Refresh token missing",
                statusCode: 401,
                errorType: "token_missing",
                path: req.path,
            });
        }

        const { newAccessToken, newRefreshToken, user } = await refreshTokenService(refreshToken);

        const sameSite = process.env.NODE_ENV === "production" ? "none" : "lax";

        // 🍪 Set updated cookies
        res.cookie(env.ACCESS_TOKEN_NAME, newAccessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite,
            path: "/",
            maxAge: 1000 * 60 * 60, // 1 hour
        });

        res.cookie(env.REFRESH_TOKEN_NAME, newRefreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite,
            path: "/",
            maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
        });

        logger.info({ message: "🟢 [REFRESH] Tokens refreshed successfully", userID: user.userID });

        return sendResponse({
            res,
            success: true,
            message: "Tokens refreshed successfully",
            statusCode: 200,
            data: { userID: user.userID, email: user.email },
            path: req.path,
        });
    } catch (err: any) {
        // Centralized error handling based on custom error types
        logger.error({ message: "❌ [REFRESH] Error during token refresh",path: req.path, error: err.message });

        switch (err.name) {
            case "InvalidTokenError":
                return sendResponse({
                    res,
                    success: false,
                    message: "Invalid refresh token",
                    statusCode: 403,
                    errorType: "invalid_token",
                    path: req.path,
                });

            case "UserNotFoundError":
                return sendResponse({
                    res,
                    success: false,
                    message: "User not found or token mismatch",
                    statusCode: 404,
                    errorType: "user_not_found",
                    path: req.path,
                });

            case "ConfigError":
                return sendResponse({
                    res,
                    success: false,
                    message: "Token configuration error",
                    statusCode: 500,
                    errorType: "config_error",
                    path: req.path,
                });

            default:
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
};
