import { Request, Response } from "express";
import { asyncHandler } from "@/middlewares/async-handler";
import { sendResponse } from "@packages/http";
import authService from "@/services/auth-service";
import { RefreshTokenPayload, verifyJwtToken } from "@packages/jwt";
import { env } from "@/config/env";
import jwt from "jsonwebtoken";
import { authLogger } from "@packages/observability";
import { SessionExpiredError } from "@packages/errors";
import { SignoutResponse } from '@packages/contracts/auth';

/**
 * Handler for user sign-out.
 * Validates input, verifies tokens and identity, and calls for signout service.
 */
export const signoutHandler = asyncHandler(
    async (req: Request, res: Response) => {
        authLogger.debug("Logging out user")
        // Verify user session token
        const userSessionToken = req.cookies[env.REFRESH_TOKEN_NAME];
        const payload = verifyJwtToken({
            token: userSessionToken,
            secret: env.JWT_REFRESH_SECRET_KEY
        }) as RefreshTokenPayload;

        // If payload is not valid, throw session expired error
        if (!payload) throw new SessionExpiredError();

        // Getting id & userSessionID from payload
        const id = payload.sub;    // Same as id
        const userSessionID = payload.userSessionID;

        authLogger.debug(
            `Attempting signout for id: ${id}, sessionID: ${userSessionID}`
        );

        // Call service → either returns ServiceResponse OR throws ServiceException
        const result = await authService.signout({ id, userSessionID });

        res.clearCookie(env.ACCESS_TOKEN_NAME, {
            path: "/",
            httpOnly: true,
            secure: env.SECURE_COOKIE_OPTION,
            sameSite: env.SAME_SITE_COOKIE_OPTION,
        });

        res.clearCookie(env.REFRESH_TOKEN_NAME, {
            path: "/",
            httpOnly: true,
            secure: env.SECURE_COOKIE_OPTION,
            sameSite: env.SAME_SITE_COOKIE_OPTION,
        });

        // Handler only returns response
        return sendResponse<SignoutResponse>({
            res,
            success: true,
            statusCode: 200,
            message: "user signed out",
            data: {
                signedOut: result.signedOut
            },
            path: req.originalUrl,
        });
    }
);
