import { Request, Response } from "express";
import { asyncHandler } from "@middlewares/async_handler";
import { sendResponse } from "@packages/shared/utils/response";
import { signoutService } from "@services/signout";
import { RefreshTokenPayload } from "@packages/shared/common/auth/jwt/types";
import { env } from "@config/env";
import jwt from "jsonwebtoken";
import { throwSessionExpired } from "@packages/shared/errors/auth/errors";

/**
 * Handler for user sign-out.
 * Validates input, verifies tokens and identity, and calls for signout service.
 */
export const signoutHandler = asyncHandler(
    async (req: Request, res: Response) => {
        // Verify user session token
        const userSessionToken = req.cookies[env.REFRESH_TOKEN_NAME];
        const payload = jwt.verify(userSessionToken, env.JWT_REFRESH_SECRET_KEY) as RefreshTokenPayload;

        // If payload is not valid, throw session expired error
        if (!payload) throwSessionExpired();

        // Getting userID & userSessionID from payload
        const userID = payload.sub;    // Same as userID
        const userSessionID = payload.userSessionID;

        // Call service → either returns ServiceResponse OR throws ServiceException
        const result = await signoutService(userID, userSessionID);

        // Handler only returns response
        return sendResponse({
            res,
            ...result,
            path: req.originalUrl,
        });
    }
);
