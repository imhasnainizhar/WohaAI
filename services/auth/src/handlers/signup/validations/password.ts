import { asyncHandler } from "@/middlewares/async-handler";
import authService from "@/services/auth-service";
import { env } from "@/config/env";
import { PasswordValidationResponse, PasswordValidationRequestSchema, PasswordValidationRequest } from "@packages/contracts/auth";
import { Request, Response } from "express";
import { ValidationError } from "@packages/errors";
import { SignupSessionPayload, verifyJwtToken } from "@packages/jwt";
import { sendResponse } from "@packages/http";


export const PasswordValidationHandler = asyncHandler(
    async (req: Request, res: Response) => {
        const token = req.cookies[env.SIGNUP_SESSION_TOKEN_NAME];

        const payload: SignupSessionPayload = verifyJwtToken({
            token,
            secret: env.JWT_SIGNUP_SESSION_SECRET_KEY
        });

        const body: PasswordValidationRequest = req.body
        const parsed = PasswordValidationRequestSchema.safeParse(body)

        if (!parsed.success) throw new ValidationError("Incorrect password format", parsed.error)

        const { passwordValidated } = await authService.validatePassword({
            signupSessionID: payload.signupSessionID,
            zodValidatedPassword: parsed.data.confirmPassword
        })

        return sendResponse<PasswordValidationResponse>({
            res,
            success: true,
            statusCode: 200,
            message: "Password validated",
            data: {
                passwordValidated
            },
            path: req.originalUrl
        })
    }
)