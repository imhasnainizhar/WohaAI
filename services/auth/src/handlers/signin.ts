import { Request, Response } from "express";
import { asyncHandler } from "../middlewares/async_handler";
import { Cookie, sendResponse } from "@packages/http";
import authService from "@/services/AuthService";
import { SigninRequestSchema } from "@packages/contracts/auth";
import { getClientData } from "../helpers/get-client-data";
import { ValidationError } from "@packages/errors";
import { env } from "@/config/env";
import { exp } from "@/config/env";


/**
 * Handler for user sign-in.
 * Validates input, verifies session token & calls for signin service.
 */
export const signinHandler = asyncHandler(
    async (req: Request, res: Response) => {
        // Validate request body
        const parsed = SigninRequestSchema.safeParse(req.body);
        if (!parsed.success) throw new ValidationError("Validation error", parsed.error);

        // Get client data for creating device signin record in DB
        const clientData = getClientData(req);

        // Call service → either returns ServiceResponse OR throws ServiceException
        const result = await authService.signin({
            usernameOrEmail: parsed.data.usernameOrEmail,
            password: parsed.data.password,
            clientData,
        });

        /**
        * Build authentication cookies
        */
        function buildCookies(
            accessToken: string,
            refreshToken: string
        ) {
            const sameSite = env.SAME_SITE_COOKIE_OPTION;
            const secureSite = env.SECURE_COOKIE_OPTION;

            return [
                {
                    name: env.ACCESS_TOKEN_NAME,
                    value: accessToken,
                    options: {
                        httpOnly: true,
                        secure: secureSite,
                        sameSite,
                        path: "/",
                        maxAge: exp.ACCESS_SESSION_COOKIE,
                    },
                },
                {
                    name: env.REFRESH_TOKEN_NAME,
                    value: refreshToken,
                    options: {
                        httpOnly: true,
                        secure: secureSite,
                        sameSite,
                        path: "/",
                        maxAge: exp.REFRESH_SESSION_COOKIE,
                    },
                },
            ];
        }

        const cookies: Cookie[] = buildCookies(result.accessToken, result.accessToken);

        // responding to client
        return sendResponse({
            res,
            success: true,
            statusCode: 200,
            message: "Signin successful",
            ...result,
            cookies,
            path: req.originalUrl,
        });
    }
);
