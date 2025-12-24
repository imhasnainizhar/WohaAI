import { Request, Response } from "express";
import { refreshTokenService } from "@services/refresh_token";
import { sendResponse, ServiceException } from "@utils/response";
import { logger } from "@utils/logger";
import { env } from "@config/env";
import { verifyJwtToken } from "@utils/jwt";
import { UserSessionRefresh } from "../internals/types/session";
import { getClientInfo } from "../utils/get_client_data";

/**
 * @controller refreshTokenController
 * Handles refresh-token rotation for a specific user session & device.
 */
export const refreshTokenController = async (req: Request, res: Response) => {
    const controllerTag = "🟢 [REFRESH_CONTROLLER]";
    const { path } = req;

    try {
        // Initial request log
        logger.info({ message: `${controllerTag} Incoming refresh token request`, path });

        // Extract refresh token from cookies
        const refreshToken = req.cookies?.[env.REFRESH_TOKEN_NAME];
        if (!refreshToken) {
            logger.warn({ message: `${controllerTag} Missing refresh token cookie`, path });
            return sendResponse({
                res,
                success: false,
                message: "Session expired",
                statusCode: 401,
                errorType: "refresh_token_missing",
                path,
            });
        }
        const payload = verifyJwtToken(refreshToken, env.JWT_REFRESH_SECRET_KEY)
        const { sub: userID, userSessionID } = payload
        if (!userID || !userSessionID) {
            logger.warn({ message: `${controllerTag} Missing refresh token cookie`, path });
            return sendResponse({
                res,
                success: false,
                message: "Session expired",
                statusCode: 401,
                errorType: "refresh_token_missing",
                path,
            });
        }
        const { userIPAddress } = getClientInfo(req);
        if (!userIPAddress) {
            logger.warn({
                message: "⚠️ [REFRESH_CONTROLLER] Unable to determine client IP address",
                userAgent: req.headers["user-agent"] || "Unknown",
                path: req.path,
            });
        }

        // Collect session/device context from headers or custom client payload
        const refreshSessionOptions: UserSessionRefresh = {
            refreshSessionToken: refreshToken,
            userID: userID,
            userSessionID: userSessionID,
            userIPAddress: userIPAddress ?? "unknown",
            rememberMe: payload.rememberMe ?? false,
        };

        // Call the refresh token service
        const result = await refreshTokenService(refreshSessionOptions);
        const { newAccessToken, newRefreshToken, user }: any = result.data;

        // Set updated cookies (access + refresh)
        const sameSite = env.NODE_ENV === "production" ? "none" : "lax";
        const secure = env.NODE_ENV === "production";

        res.cookie(env.ACCESS_TOKEN_NAME, newAccessToken, {
            httpOnly: true,
            secure,
            sameSite,
            path: "/",
            maxAge: 1000 * 60 * 60, // 1 hour
        });

        res.cookie(env.REFRESH_TOKEN_NAME, newRefreshToken, {
            httpOnly: true,
            secure,
            sameSite,
            path: "/",
            maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
        });

        // Log success and respond
        logger.info({
            message: `${controllerTag} Tokens rotated successfully`,
            userID: payload.sub,
            sessionID: payload.userSessionID,
            path,
        });

        return sendResponse({
            res,
            success: true,
            message: "Tokens refreshed successfully",
            statusCode: 200,
            data: { userID: user.userID, email: user.email },
            path,
        });
    } catch (err: any) {
        // Centralized error management
        if (err instanceof ServiceException) {
            logger.warn({
                message: `🔴 ${controllerTag} Service-level error`,
                path,
                errorType: err.response.errorType,
                details: err.response.message,
            });

            return sendResponse({
                res,
                ...err.response,
                path,
            });
        }

        // Unexpected errors
        logger.error({
            message: `❌ ${controllerTag} Unexpected failure`,
            path,
            error: err?.message,
            stack: err?.stack,
        });

        return sendResponse({
            res,
            success: false,
            statusCode: 500,
            message: "Internal server error",
            errorType: "internal_error",
            path,
        });
    }
};
