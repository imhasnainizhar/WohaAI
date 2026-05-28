import { Request, Response } from "express";
import { asyncHandler } from "../middlewares/async-handler";
import { Cookie, sendResponse } from "@packages/http";
import authService from "@/services/auth-service";
import { SigninRequestSchema } from "@packages/contracts/auth";
import { getClientData } from "../ua/client-data";
import { ValidationError } from "@packages/errors";
import { buildCookie } from "@packages/http";
import { env } from "@/config/env";
import { exp } from "@/config/exp";


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
        const {
            profilePicURI,
            userID,
            firstName,
            lastName,
            email,
            refreshToken,
            accessToken
        } = await authService.signin({
            usernameOrEmail: parsed.data.usernameOrEmail,
            password: parsed.data.password,
            clientData,
        });

        /**
        * Build authentication cookies
        */
        const refreshTokenCookie: Cookie = buildCookie({
            name: env.REFRESH_TOKEN_NAME,
            value: refreshToken,
            options: {
                httpOnly: true,
                secure: env.NODE_ENV === "production",
                sameSite: "lax",
                path: "/",
                maxAge: exp.ACCESS_SESSION_COOKIE
            }        
        });

        const accessTokenCookie: Cookie = buildCookie({
            name: env.ACCESS_TOKEN_NAME,
            value: accessToken,
            options: {
                httpOnly: true,
                secure: env.NODE_ENV === "production",
                sameSite: "lax",
                path: "/",
                maxAge: exp.ACCESS_SESSION_COOKIE
            }        
        });

        // responding to client
        return sendResponse({
            res,
            success: true,
            statusCode: 200,
            message: "Signin successful",
            data: {
                profilePicURI,
                userID,
                firstName,
                lastName,
                email, 
            },
            cookies: [ refreshTokenCookie, accessTokenCookie ],
            path: req.originalUrl,
        });
    }
);
