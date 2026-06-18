import { Request, Response } from "express";
import { asyncHandler } from "@/middlewares/async-handler";
import { buildCookie, sendResponse } from "@wohaai/http";
import authService from "@/services/auth-service";
import { env } from "@wohaai/env-ts";
import exp from "../../../../../../packages/config/exp.json";
import { AuthSessionPayload, verifyJwtToken } from "@wohaai/security/jwt";
import { ValidationError } from "@wohaai/errors";
import { VerifyUserEmailRequest, VerifyUserEmailRequestSchema } from "@wohaai/validations";
import tokenNames from "../../../../../../packages/config/token-names.json";
import { authLogger } from "@wohaai/telemetry";

/**
 * Handler for verifying signup signup email using OTP.
 */
export const verifyUserEmailHandler = asyncHandler(
    async (req: Request, res: Response) => {

        const token = req.cookies[tokenNames.AUTH_SESSION_TOKEN];

        const payload: AuthSessionPayload = verifyJwtToken({
            token,
            secret: env.JWT_AUTH_SECRET_KEY
        });

        // extracting code from request body
        const body: VerifyUserEmailRequest = req.body

        // validating code with zod
        const parsed = VerifyUserEmailRequestSchema.safeParse(body)

        if (!parsed.success) throw new ValidationError("Invalid code", parsed.error)

        // Getting authSessionID from payload
        const authSessionID = payload.sub;

        // Call service → either returns ServiceResponse OR throws ServiceException
        const result = await authService.verifyUserEmail({
            authSessionID,
            verificationCode: parsed.data.verificationCode
        });

        const cookie = buildCookie({
            name: tokenNames.AUTH_SESSION_TOKEN,
            value: result.authToken,
            options: {
                httpOnly: true,
                secure: env.NODE_ENV === "production",
                sameSite: "lax",
                path: "/",
                maxAge: exp.AUTH_SESSION_COOKIE
            }
        })


        // response
        return sendResponse({
            res,
            success: true,
            statusCode: 200,
            message: "User email verified",
            path: req.originalUrl,
            cookies: [cookie]
        });
    }
);
