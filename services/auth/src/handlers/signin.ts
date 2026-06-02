import { Request, Response } from "express";
import { asyncHandler } from "../middlewares/async-handler";
import { Cookie, sendResponse } from "@packages/http";
import authService from "@/services/auth-service";
import { SignInRequest, SigninRequestSchema, SigninResponse } from "@packages/contracts/auth";
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

        const body: SignInRequest = req.body

        const parsed = SigninRequestSchema.safeParse(body);
        if (!parsed.success) throw new ValidationError("Validation error", parsed.error);

        // Get client data for creating device signin record in DB
        const clientData = getClientData(req);

        // Call service → either returns ServiceResponse OR throws ServiceException
        const {
            profilePicURI,
            userID,
            username,
            firstName,
            lastName,
            email,
            refreshToken,
            accessToken
        } = await authService.signin({
            usernameOrEmail: parsed.data.usernameOrEmail,
            password: parsed.data.password,
            rememberMe: parsed.data.rememberMe,
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
                maxAge: parsed.data.rememberMe ? exp.REFRESH_TOKEN_COOKIE : undefined
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
                maxAge: parsed.data.rememberMe ? exp.ACCESS_TOKEN_COOKIE : undefined
            }        
        });

        // responding to client
        return sendResponse<SigninResponse>({
            res,
            success: true,
            statusCode: 200,
            message: "Signin successful",
            data: {
                profilePicURI,
                userID,
                username,
                firstName,
                lastName,
                email, 
            },
            cookies: [ refreshTokenCookie, accessTokenCookie ],
            path: req.originalUrl,
        });
    }
);