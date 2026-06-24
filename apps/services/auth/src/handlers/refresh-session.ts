import { ClientData } from '@wohaai/types';
import { asyncHandler } from "@/middlewares/async-handler";
import { getClientData } from "@/ua/client-data";
import { buildCookie, sendResponse } from "@wohaai/http";
import { ExpressAdapter } from "@wohaai/http";
import { Request, Response } from "express";
import { env } from "@wohaai/env-ts";
import { authLogger } from "@wohaai/telemetry";
import exp from '../../../../../packages/config/exp.json';
import { RefreshTokenPayload, verifyJwtToken } from '@wohaai/security/jwt';
import { ValidationError } from '@wohaai/errors';
import authService from '@/services/auth-service';
import JwtTokenNames from '../../../../../packages/config//token-names.json';


/**
 * Handler for user refresh token.
 * Verifies session token & calls for refresh token service.
 * For rotating refresh token hash and allocating new access token.
 */
export const refreshSessionHandler = asyncHandler(
    async (req: Request, res: Response) => {
        authLogger.debug({ path: req.originalUrl, method: req.method }, "🔄 Session refresh requested");

        const refreshToken = req.cookies[JwtTokenNames.REFRESH_TOKEN];

        const _ = verifyJwtToken({
            token: refreshToken,
            secret: env.JWT_AUTH_SECRET_KEY
        }) as RefreshTokenPayload;

        // Getting client data
        const clientData = getClientData(req);

        // If client data is not valid, throw client error
        // Under review
        if (!clientData) {
            authLogger.debug({ path: req.originalUrl }, "❌ Session refresh failed - invalid client data");
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
            name: JwtTokenNames.REFRESH_TOKEN,
            value: newRefreshToken,
            options: {
                httpOnly: true,
                secure: env.NODE_ENV === "production",
                sameSite: "lax",
                path: "/",
                maxAge: exp.REFRESH_TOKEN_COOKIE
            }
        })

        const accessTokenCookie = buildCookie({
            name: JwtTokenNames.ACCESS_TOKEN,
            value: newAccessToken,
            options: {
                httpOnly: true,
                secure: env.NODE_ENV === "production",
                sameSite: "lax",
                path: "/",
                maxAge: exp.ACCESS_TOKEN_COOKIE
            }
        })

        authLogger.debug({ path: req.originalUrl, method: req.method, userIPAddress }, "✅ Session refresh successful");

        // Handler only returns response
        // Cookies are under the hood set as Express Cookies with name having token as value in this refresh token context. Cookie options are used to configure security and exp options.
        return sendResponse({
            res: new ExpressAdapter(res),
            success: true,
            statusCode: 200,
            message: "user session refreshed",
            path: req.originalUrl,
            cookies: [refreshTokenCookie, accessTokenCookie]
        });
    }
);