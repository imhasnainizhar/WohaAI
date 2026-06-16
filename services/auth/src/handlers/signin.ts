import { Request, Response } from "express";
import { asyncHandler } from "../middlewares/async-handler";
import { Cookie, sendResponse } from "@packages/http";
import authService from "@/services/auth-service";
import { getClientData } from "../ua/client-data";
import { ValidationError } from "@packages/errors";
import { buildCookie } from "@packages/http";
import { env } from "@packages/env-ts";
import exp from "../../../../packages/config/exp.json";
import { SigninCompleteRequest, SigninCompleteResponse, SigninCompleteSchema, SigninInitRequest, SigninInitRequestSchema } from "@packages/contracts/auth";
import JwtTokenNames from "../../../../packages/config/token-names.json";
import { AuthSessionPayload, verifyJwtToken } from "@packages/security/jwt";


/**
 * Handler for user sign-in.
 * Validates input, verifies session token & calls for signin service.
 */
export const SigninInitHandler = asyncHandler(
    async (req: Request, res: Response) => {
        // Validate request body
        const body: SigninInitRequest = req.body

        const parsed = SigninInitRequestSchema.safeParse(body);
        if (!parsed.success) throw new ValidationError("Validation error", parsed.error);

        // Get client data for creating device signin record in DB
        const clientData = getClientData(req);

        // Call service → either returns ServiceResponse OR throws ServiceException
        const { authSessionToken } = await authService.signinInit({ usernameOrEmail: parsed.data.usernameOrEmail });

        /**
        * Build authentication cookies
        */
        const authSessionCookie: Cookie = buildCookie({
            name: JwtTokenNames.AUTH_SESSION_TOKEN,
            value: authSessionToken,
            options: {
                httpOnly: true,
                secure: env.NODE_ENV === "production",
                sameSite: "lax",
                path: "/",
                maxAge: exp.AUTH_SESSION_COOKIE
            }
        });

        // Handler only returns response
        // Cookies are under the hood set as Express Cookies with name having token as value in this sign-in context. Cookie options are used to configure security and exp options.
        return sendResponse({
            res,
            success: true,
            statusCode: 200,
            message: "Sign-in initialized",
            cookies: [authSessionCookie]
        });
    }
);

export const signinHandler = asyncHandler(
    async (req: Request, res: Response) => {
        const token = req.cookies[JwtTokenNames.AUTH_SESSION_TOKEN];

        const payload = verifyJwtToken({
            token,
            secret: env.JWT_AUTH_SECRET_KEY
        }) as AuthSessionPayload;

        // Validate request body
        const body: SigninCompleteRequest = req.body

        const parsed = SigninCompleteSchema.safeParse(body);
        if (!parsed.success) throw new ValidationError("Validation error", parsed.error);

        // Get client data for creating device signin record in DB
        const clientData = getClientData(req);

        // Call service → either returns ServiceResponse OR throws ServiceException
        const {
            profilePicURI,
            userID,
            username,
            fullName,
            email,
            refreshToken,
            accessToken
        } = await authService.signinComplete({
            usernameOrEmail: payload.usernameOrEmail!,
            password: parsed.data.password,
            clientData,
        });

        /**
        * Build authentication cookies
        */
        const refreshTokenCookie: Cookie = buildCookie({
            name: JwtTokenNames.REFRESH_TOKEN,
            value: refreshToken,
            options: {
                httpOnly: true,
                secure: env.NODE_ENV === "production",
                sameSite: "lax",
                path: "/",
                maxAge: exp.REFRESH_TOKEN_COOKIE
            }
        });

        const accessTokenCookie: Cookie = buildCookie({
            name: JwtTokenNames.ACCESS_TOKEN,
            value: accessToken,
            options: {
                httpOnly: true,
                secure: env.NODE_ENV === "production",
                sameSite: "lax",
                path: "/",
                maxAge: exp.ACCESS_TOKEN_COOKIE
            }
        });

        // responding to client
        return sendResponse<SigninCompleteResponse>({
            res,
            success: true,
            statusCode: 200,
            message: "Signin successful",
            data: {
                profilePicURI,
                userID,
                username,
                fullName,
                email,
            },
            cookies: [refreshTokenCookie, accessTokenCookie],
            path: req.originalUrl,
        });
    }
);