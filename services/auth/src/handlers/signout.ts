import { Request, Response } from "express";
import { asyncHandler } from "@/middlewares/async-handler";
import { sendResponse } from "@packages/http";
import authService from "@/services/auth-service";
import { RefreshTokenPayload } from "@packages/jwt";
import { env } from "@/config/env";
import jwt from "jsonwebtoken";
import { logger } from "@packages/observability";
import { SessionExpiredError } from "@packages/errors";

/**
 * Handler for user sign-out.
 * Validates input, verifies tokens and identity, and calls for signout service.
 */
export const signoutHandler = asyncHandler(
    async (req: Request, res: Response) => {
        logger.debug("Logging out user")
        // Verify user session token
        const userSessionToken = req.cookies[env.REFRESH_TOKEN_NAME];
        const payload = jwt.verify(userSessionToken, env.JWT_REFRESH_SECRET_KEY) as RefreshTokenPayload;

        // If payload is not valid, throw session expired error
        if (!payload) throw new SessionExpiredError();

        // Getting userID & userSessionID from payload
        const userID = payload.sub;    // Same as userID
        const userSessionID = payload.userSessionID;

        logger.debug(
            `Attempting signout for userID: ${userID}, sessionID: ${userSessionID}`
        );

        // Call service → either returns ServiceResponse OR throws ServiceException
        const result = await authService.signout({userID, userSessionID});

        // Handler only returns response
        return sendResponse({
            res,
            success: true,
            statusCode: 200,
            message: "user signed out",
            data: {
                signedout: result.signedOut
            },
            path: req.originalUrl,
        });
    }
);
