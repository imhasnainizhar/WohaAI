import { ClientData } from '@packages/contracts/auth';
import { asyncHandler } from "@/middlewares/async-handler";
import { getClientData } from "@/ua/client-data";
import { buildCookie, Cookie, sendResponse } from "@packages/http";
import { CookieOptions, Request, Response } from "express";
import { env } from '@/config/env';
import { exp } from '@/config/exp';
import jwt from 'jsonwebtoken';
import { RefreshTokenPayload } from '@packages/jwt';
import { SessionExpiredError, ValidationError } from '@packages/errors';
import authService from '@/services/auth-service';


/**
 * Handler for user refresh token.
 * Verifies session token & calls for refresh token service.
 * For rotating refresh token hash and allocating new access token.
 */
export const refreshTokenHandler = asyncHandler(
    async (req: Request, res: Response) => {
        const refreshToken = req.cookies[env.REFRESH_TOKEN_NAME];
        const payload = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET_KEY) as RefreshTokenPayload;

        // If payload is not valid, throw session expired error
        if (!payload) throw new SessionExpiredError();

        // Getting client data
        const clientData = getClientData(req);

        // If client data is not valid, throw client error
        // Under review
        if (!clientData) {
            throw new ValidationError()
        }

        // Getting user IP address from client data
        const { userIPAddress }: ClientData = clientData;

        // Call service → either returns ServiceResponse OR throws ServiceException
        const { newRefreshToken, newAccessToken } = await authService.refreshSession({
            refreshToken,
            userIPAddress
        });

        const refreshTokenCookie = buildCookie({
            name: env.REFRESH_TOKEN_NAME,
            value: newRefreshToken,
            options: {
                httpOnly: true,
                secure: env.NODE_ENV === "production",
                sameSite: "lax",
                path: "/",
                maxAge: exp.REFRESH_SESSION_COOKIE
            }        
        })

        const accessTokenCookie = buildCookie({
            name: env.ACCESS_TOKEN_NAME,
            value: newAccessToken,
            options: {
                httpOnly: true,
                secure: env.NODE_ENV === "production",
                sameSite: "lax",
                path: "/",
                maxAge: exp.ACCESS_SESSION_COOKIE
            }        
        })

        // Handler only returns response
        // Cookies are under the hood set as Express Cookies with name having token as value in this refresh token context. Cookie options are used to configure security and exp options.
        return sendResponse({
            res,
            success: true,
            statusCode: 200,
            message: "user session refreshed",
            path: req.originalUrl,
            cookies: [refreshTokenCookie, accessTokenCookie]
        });
    }
);