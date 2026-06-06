import { asyncHandler } from "@/middlewares/async-handler";
import authService from "@/services/auth-service";
import { env } from "@/config/env";
import {
    PersonalInfoValidationRequest,
    PersonalInfoValidationRequestSchema,
    PersonalInfoValidationResponse,
} from "@packages/contracts/auth";
import { Request, Response } from "express";
import { ValidationError } from "@packages/errors";
import { SignupSessionPayload, verifyJwtToken } from "@packages/jwt";
import { sendResponse } from "@packages/http";


export const PersonalInfoValidationHandler = asyncHandler(
    async (req: Request, res: Response) => {
        const token = req.cookies[env.SIGNUP_SESSION_TOKEN_NAME];

        const payload: SignupSessionPayload = verifyJwtToken({
            token,
            secret: env.JWT_SIGNUP_SESSION_SECRET_KEY
        });
        const body: PersonalInfoValidationRequest = req.body;

        const parsed = PersonalInfoValidationRequestSchema.safeParse(body)

        if (!parsed.success) throw new ValidationError("Incorrect name format", parsed.error)

        const { personalInfoValidated } = await authService.validatePersonalInfo({
            signupSessionID: payload.signupSessionID,
            firstName: parsed.data.firstName,
            lastName: parsed.data.lastName,
            dateOfBirth: parsed.data.dateOfBirth,
        })

        return sendResponse<PersonalInfoValidationResponse>({
            res,
            success: true,
            statusCode: 200,
            message: "Personal info validated",
            data: {
                personalInfoValidated
            },
            path: req.originalUrl
        })
    }
)