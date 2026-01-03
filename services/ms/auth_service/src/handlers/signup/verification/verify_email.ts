import { Request, Response } from "express";
import { asyncHandler } from "@middlewares/async_handler";
import { sendResponse } from "@shared/utils/response";
import { verifyUserEmailService } from "@services/signup/verification/confirm_email";
import { env } from "@config/env";
import jwt from "jsonwebtoken";
import { SignupSessionPayload } from "@shared/common/auth/jwt/types";
import { throwSessionExpired } from "@shared/errors/auth/errors";

/**
 * Handler for user signup verification verify email.
 * Validates input & calls for verify email service.
 */
export const verifyUserEmailHandler = asyncHandler(
    async (req: Request, res: Response) => {
        const token = req.cookies[env.SIGNUP_SESSION_TOKEN_NAME];
        const payload = jwt.verify(token, env.JWT_SIGNUP_SESSION_SECRET_KEY) as SignupSessionPayload;

        // If payload is not valid, throw session expired error
        if (!payload) throwSessionExpired();

        // Getting signupSessionID from payload
        const signupSessionID = payload.signupSessionID;

        // Call service → either returns ServiceResponse OR throws ServiceException
        const result = await verifyUserEmailService({ signupSessionID, verificationCode: req.body.verificationCode });

        // Handler only returns response
        return sendResponse({
            res,
            ...result,
            path: req.originalUrl,
        });
    }
);
