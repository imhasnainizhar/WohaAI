import { Request, Response } from "express";
import { asyncHandler } from "@middlewares/async_handler";
import { sendVerificationEmailService } from "@services/signup/verification/send_email";
import { env } from "@config/env";
import jwt from "jsonwebtoken";
import { SignupSessionPayload } from "@packages/shared/common";
import { throwSessionExpired } from "@packages/shared/errors";
import { sendResponse } from "@packages/shared/utils";

/**
 * Handler for user signup verification send email.
 * Validates input & calls for send verification email service.
 */
export const sendVerificationEmailHandler = asyncHandler(
    async (req: Request, res: Response) => {
        const token = req.cookies[env.SIGNUP_SESSION_TOKEN_NAME];
        const payload = jwt.verify(token, env.JWT_SIGNUP_SESSION_SECRET_KEY) as SignupSessionPayload;

        // If payload is not valid, throw session expired error
        if (!payload) throwSessionExpired();

        // Getting signupSessionID from payload
        const signupSessionID = payload.signupSessionID;

        // Call service → either returns ServiceResponse OR throws ServiceException
        const result = await sendVerificationEmailService({ signupSessionID });

        // Handler only returns response
        return sendResponse({
            res,
            ...result,
            path: req.originalUrl,
        });
    }
);
