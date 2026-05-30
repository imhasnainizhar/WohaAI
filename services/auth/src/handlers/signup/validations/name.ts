import { asyncHandler } from "@/middlewares/async-handler";
import authService from "@/services/auth-service";
import { env } from "@/config/env";
import { 
    NameValidationResponse, 
    NameValidationSchema, 
} from "@packages/contracts/auth";
import { Request, Response } from "express";
import { ValidationError } from "@packages/errors";
import { SignupSessionPayload, verifyJwtToken } from "@packages/jwt";
import { sendResponse } from "@packages/http";


export const NameValidationHandler = asyncHandler(
    async (req: Request, res: Response) => {
        const token = req.cookies[env.SIGNUP_SESSION_TOKEN_NAME];

        const payload: SignupSessionPayload = verifyJwtToken({
            token,
            secret: env.JWT_SIGNUP_SESSION_SECRET_KEY
        });

        const firstName = req.body.firstName;
        const lastName = req.body.lastName

        const parsed = NameValidationSchema.safeParse({
            firstName,
            lastName
        })

        if (!parsed.success) throw new ValidationError("Incorrect name format", parsed.error)

        const { nameValidated } = await authService.validateName({
            signupSessionID: payload.signupSessionID,
            firstName: parsed.data.firsrName,
            lastName: parsed.data.lastName
        })

        return sendResponse<NameValidationResponse>({
            res,
            success: true,
            statusCode: 200,
            message: "names validated",
            data: {
                nameValidated
            },
            path: req.originalUrl
        })
    }
)