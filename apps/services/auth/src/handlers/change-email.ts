import { Request, Response } from "express";
import { asyncHandler } from "@/middlewares/async-handler";
import { sendResponse } from "@wohaai/http";

import {
    ChangeEmailRequest,
    ChangeEmailRequestSchema,
    SessionIDSchema,
} from "@wohaai/validations";

import { ValidationError } from "@wohaai/errors";
import authService from "@/services/auth-service";
import { AccessTokenPayload, verifyJwtToken } from "@wohaai/security/jwt";
import tokenNames from "../../../../packages/config/token-names.json"

export const requestEmailChangeHandler = asyncHandler(
    async (req: Request, res: Response) => {
        const accessToken = req.cookies[tokenNames.ACCESS_TOKEN]
        const payload = verifyJwtToken(accessToken) as AccessTokenPayload

        const body: ChangeEmailRequest = req.body;
        const userID: string = payload.sub;

        const parsed =
            ChangeEmailRequestSchema.safeParse(body);

        if (!parsed.success) {
            throw new ValidationError(
                "Given email could not be validated.",
                parsed.error
            );
        }

        await authService.requestEmailChange({
            userID,
            newEmail: parsed.data.newEmail
        });

        return sendResponse({
            res,
            success: true,
            statusCode: 200,
            message: "Email sent to verify email change request.",
            path: req.originalUrl
        });
    }
);

export const verifyEmailChangeHandler = asyncHandler(
    async (req: Request, res: Response) => {

        const sessionID = req.query.sessionID as string
        const parsed = SessionIDSchema.safeParse(sessionID)
        if (!parsed.success) throw new ValidationError("Invalid session ID")

        await authService.verifyEmailChange({
            sessionID: parsed.data
        });

        return sendResponse({
            res,
            success: true,
            statusCode: 200,
            message: "Email successfully verified and changed.",
            path: req.originalUrl
        });
    }
);