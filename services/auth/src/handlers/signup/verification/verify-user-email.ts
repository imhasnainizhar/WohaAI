import { Request, Response } from "express";
import { asyncHandler } from "@/middlewares/async-handler";
import { buildCookie, sendResponse } from "@packages/http";
import authService from "@/services/auth-service";
import { env } from "@/config/env";
import { exp } from "@/config/exp";
import { SignupSessionPayload, verifyJwtToken } from "@packages/jwt";
import { ValidationError } from "@packages/errors";
import { VerifyUserEmailRequestSchema } from "@packages/contracts/auth";
import { VerifyUserEmailResponse } from '@packages/contracts/auth';

/**
 * Handler for user signup verification verify email.
 * Validates input & calls for verify email service.
 */
export const verifyUserEmailHandler = asyncHandler(
    async (req: Request, res: Response) => {

        const token = req.cookies[env.SIGNUP_SESSION_TOKEN_NAME];

        const payload: SignupSessionPayload = verifyJwtToken({
            token,
            secret: env.JWT_SIGNUP_SESSION_SECRET_KEY
        });

        // extracting code from request body
        const code = req.body.code

        // validating code with zod
        const parsed = VerifyUserEmailRequestSchema.safeParse(code)

        if (!parsed.success) throw new ValidationError("Invalid code", parsed.error)

        // Getting signupSessionID from payload
        const signupSessionID = payload.signupSessionID;

        // Call service → either returns ServiceResponse OR throws ServiceException
        const result = await authService.verifyUserEmail({
            signupSessionID,
            verificationCode: parsed.data.verificationCode
        });

        const extendedSignupSessionCookie = buildCookie({
            name: env.SIGNUP_SESSION_TOKEN_NAME,
            value: result.extendedSignupToken,
            options: {
                httpOnly: true,
                secure: env.NODE_ENV === "production",
                sameSite: "lax",
                path: "/",
                maxAge: exp.SIGNUP_SESSION_COOKIE_EXTENDED
            }          
        })


        // response
        return sendResponse<VerifyUserEmailResponse>({
            res,
            success: true,
            statusCode: 200,
            message: "User email verified",
            data: {
                emailVerified: true
            },
            path: req.originalUrl,
            cookies: [ extendedSignupSessionCookie ]
        });
    }
);
