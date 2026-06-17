import { asyncHandler } from "@/middlewares/async-handler";
import authService from "@/services/auth-service";
import { env } from "@packages/env-ts";
import { PasswordValidationRequestSchema, PasswordValidationRequest } from "@packages/contracts/auth";
import { Request, Response } from "express";
import { ValidationError } from "@packages/errors";
import { AuthSessionPayload, verifyJwtToken } from "@packages/security/jwt";
import { sendResponse } from "@packages/http";
import tokenNames from "../../../../../packages/config/token-names.json";

export const passwordValidationHandler = asyncHandler(
    async (req: Request, res: Response) => {
        const token = req.cookies[tokenNames.AUTH_SESSION_TOKEN];
        const payload: AuthSessionPayload = verifyJwtToken({
            token,
            secret: env.JWT_AUTH_SECRET_KEY
        });

        const body: PasswordValidationRequest = req.body

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