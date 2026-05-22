import { ClientData } from '@packages/shared/common';
import { asyncHandler } from "@middlewares/async_handler";
import { getClientData } from "@internals/utils/get_client_data";
import { refreshTokenService } from "@services/refresh/refresh_token";
import { sendResponse, ServiceException, ServiceResponse } from "@packages/shared/utils";
import { Request, Response } from "express";
import { env } from '@config/env';
import jwt from 'jsonwebtoken';
import { RefreshTokenPayload } from '@packages/shared/common';
import { throwSessionExpired } from '@packages/shared/errors';


/**
 * Handler for user refresh token.
 * Verifies session token & calls for refresh token service.
 * For rotating refresh token hash and allocating new access token.
 */
export const refreshTokenHandler = asyncHandler(
    async (req: Request, res: Response) => {
        const token = req.cookies[env.REFRESH_TOKEN_NAME];
        const payload = jwt.verify(token, env.JWT_REFRESH_SECRET_KEY) as RefreshTokenPayload;

        // If payload is not valid, throw session expired error
        if (!payload) throwSessionExpired();

        // Getting client data
        const clientData = getClientData(req);

        // If client data is not valid, throw client error
        if (!clientData) {
            throw new ServiceException(
                ServiceResponse.error({
                    success: false,
                    statusCode: 400,
                    message: "Failed to get client information.",
                    errorType: "client_error",
                })
            );
        }

        // Getting user IP address from client data
        const { userIPAddress }: ClientData = clientData;

        // Call service → either returns ServiceResponse OR throws ServiceException
        const result = await refreshTokenService({ cookies: req.cookies, userIPAddress });

        // Handler only returns response
        return sendResponse({
            res,
            ...result,
            path: req.originalUrl,
        });
    }
);
