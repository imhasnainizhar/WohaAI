import { asyncHandler } from "@/middlewares/async-handler";
import authService from "@/services/auth-service";
import { env } from "@wohaai/env-ts";
import { PasswordValidationRequestSchema, TPasswordValidationRequest } from "@wohaai/validations";
import { Request, Response } from "express";
import { ValidationError } from "@wohaai/errors";
import { AuthSessionPayload, verifyJwtToken } from "@wohaai/security/jwt";
import { sendResponse } from "@wohaai/http";
import tokenNames from "../../../../../../packages/config/token-names.json";

export const passwordValidationHandler = asyncHandler(
    async (req: Request, res: Response) => {
        const token = req.cookies[tokenNames.AUTH_SESSION_TOKEN];
        const payload: AuthSessionPayload = verifyJwtToken({
            token,
            secret: env.JWT_AUTH_SECRET_KEY
        });

        const body: TPasswordValidationRequest = req.body

        const parsed = PasswordValidationRequestSchema.safeParse(body)

        if (!parsed.success) throw new ValidationError("Incorrect password format", parsed.error)

        await authService.validatePassword({
            authSessionID: payload.sub,
            zodValidatedPassword: parsed.data.confirmPassword
        })

        return sendResponse({
            res,
            success: true,
            statusCode: 200,
            message: "Password validated successfully",
            path: req.originalUrl
        })
    }
)