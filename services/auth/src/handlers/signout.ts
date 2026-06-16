import { Request, Response } from "express";
import { asyncHandler } from "@/middlewares/async-handler";
import { sendResponse } from "@packages/http";
import authService from "@/services/auth-service";
import { RefreshTokenPayload, verifyJwtToken } from "@packages/security/jwt";
import { env } from "@packages/env-ts";
import { authLogger } from "@packages/observability";
import { SessionExpiredError } from "@packages/errors";
import JwtTokenNames from "../../../../packages/config/token-names.json";

/**
 * Handler for user sign-out.
 * Validates input, verifies tokens and identity, and calls for signout service.
 */
export const signoutHandler = asyncHandler(
    async (req: Request, res: Response) => {
        authLogger.debug("Logging out user")
        // Verify user session token
        const refreshToken = req.cookies[JwtTokenNames.REFRESH_TOKEN];
        const payload = verifyJwtToken({
            token: refreshToken,
            secret: env.JWT_AUTH_SECRET_KEY
        }) as RefreshTokenPayload;

        // If payload is not valid, throw session expired error
        if (!payload) throw new SessionExpiredError();

        // Getting userID & userSessionID from payload
        const userID = payload.sub;    // Same as userID
        const userSessionID = payload.userSessionID;

        authLogger.debug(
            `Attempting signout for userID: ${userID}, sessionID: ${userSessionID}`
        );

        // Call service → either returns ServiceResponse OR throws ServiceException
        const result = await authService.signout({ userID, userSessionID });

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
