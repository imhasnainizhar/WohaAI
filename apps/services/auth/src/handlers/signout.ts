import { Request, Response } from "express";
import { asyncHandler } from "@/middlewares/async-handler";
import { sendResponse } from "@wohaai/http";
import authService from "@/services/auth-service";
import { RefreshTokenPayload, verifyJwtToken } from "@wohaai/security/jwt";
import { env } from "@wohaai/env-ts";
import { authLogger } from "@wohaai/telemetry";
import { SessionExpiredError } from "@wohaai/errors";
import JwtTokenNames from "../../../../packages/config/token-names.json";

/**
 * Handler for user sign-out.
 * Validates input, verifies tokens and identity, and calls for signout service.
 */
export const signoutHandler = asyncHandler(
    async (req: Request, res: Response) => {
        authLogger.debug({ path: req.originalUrl, method: req.method }, "👋 Signout requested");

        // Verify user session token
        const refreshToken = req.cookies[JwtTokenNames.REFRESH_TOKEN];
        const payload = verifyJwtToken({
            token: refreshToken,
            secret: env.JWT_AUTH_SECRET_KEY
        }) as RefreshTokenPayload;

        // If payload is not valid, throw session expired error
        if (!payload) {
            authLogger.debug({ path: req.originalUrl }, "❌ Signout failed - session expired");
            throw new SessionExpiredError();
        }

        // Getting userID & userSessionID from payload
        const userID = payload.sub;    // Same as userID
        const userSessionID = payload.sid;

        authLogger.debug({ userID, userSessionID }, "🔍 Processing signout");

        // Call service → either returns ServiceResponse OR throws ServiceException
        await authService.signout({ userID, userSessionID });

        res.clearCookie(JwtTokenNames.ACCESS_TOKEN, {
            path: "/",
            httpOnly: true,
            secure: env.NODE_ENV === "production",
            sameSite: "lax",
        });

        res.clearCookie(JwtTokenNames.REFRESH_TOKEN, {
            path: "/",
            httpOnly: true,
            secure: env.NODE_ENV === "production",
            sameSite: "lax",
        });

        authLogger.debug({ path: req.originalUrl, method: req.method, userID }, "✅ Signout successful");

        // Handler only returns response
        return sendResponse({
            res,
            success: true,
            statusCode: 200,
            message: "user signed out",
            path: req.originalUrl,
        });
    }
);
