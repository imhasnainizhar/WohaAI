import { Request, Response } from "express";
import { asyncHandler } from "../middlewares/async-handler";
import { Cookie, sendResponse } from "@wohaai/http";
import { ExpressAdapter } from "@wohaai/http";
import authService from "@/services/auth-service";
import { getClientData } from "../ua/client-data";
import { ValidationError } from "@wohaai/errors";
import { buildCookie } from "@wohaai/http";
import { env } from "@wohaai/env-ts";
import { authLogger } from "@wohaai/telemetry";
import exp from "../../../../../packages/config/exp.json";
import { TSigninCompleteRequest, SigninCompleteRequestSchema, TSigninInitRequest, SigninInitRequestSchema } from "@wohaai/validations";
import { SigninCompleteResponse } from "@wohaai/types";
import JwtTokenNames from "../../../../../packages/config/token-names.json";
import { AuthSessionPayload, verifyJwtToken } from "@wohaai/security/jwt";


/**
 * Handler for user sign-in.
 * Validates input, verifies session token & calls for signin service.
 */
export const signinInitHandler = asyncHandler(
    async (req: Request, res: Response) => {
        // Validate request body
        const body: TSigninInitRequest = req.body

        const parsed = SigninInitRequestSchema.safeParse(body);
        if (!parsed.success) {
            authLogger.debug({ errors: parsed.error.issues }, "❌ Signin init validation failed");
            throw new ValidationError("Validation error", parsed.error);
        }

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

        authLogger.debug({ path: req.originalUrl, method: req.method }, "✅ Signin init successful");

        // Handler only returns response
        // Cookies are under the hood set as Express Cookies with name having token as value in this sign-in context. Cookie options are used to configure security and exp options.
        return sendResponse({
            res: new ExpressAdapter(res),
            success: true,
            statusCode: 200,
            message: "Sign-in initialized",
            cookies: [authSessionCookie]
        });
    }
);

export const signinCompleteHandler = asyncHandler(
    async (req: Request, res: Response) => {
        const token = req.cookies[JwtTokenNames.AUTH_SESSION_TOKEN];

        const payload = verifyJwtToken({
            token,
            secret: env.JWT_AUTH_SECRET_KEY
        }) as AuthSessionPayload;

        // Validate request body
        const body: TSigninCompleteRequest = req.body

        const parsed = SigninCompleteRequestSchema.safeParse(body);
        if (!parsed.success) {
            authLogger.debug({ errors: parsed.error.issues }, "❌ Signin complete validation failed");
            throw new ValidationError("Validation error", parsed.error);
        }

        // Get client data for creating device signin record in DB
        const clientData = getClientData(req);

        // Call service → either returns ServiceResponse OR throws ServiceException
        const {
            profilePicURI,
            userID,
            username,
            fullName,
            email,
            dateOfBirth,
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

        authLogger.debug({ path: req.originalUrl, method: req.method, userID }, "✅ Signin complete successful");

        // responding to client
        return sendResponse<SigninCompleteResponse>({
            res: new ExpressAdapter(res),
            success: true,
            statusCode: 200,
            message: "Signin successful",
            data: {
                userID,
                username,
                fullName,
                email,
                dateOfBirth
            },
            cookies: [refreshTokenCookie, accessTokenCookie],
            path: req.originalUrl,
        });
    }
);