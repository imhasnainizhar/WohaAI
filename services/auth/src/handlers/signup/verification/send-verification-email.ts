import { Request, Response } from "express";
import { asyncHandler } from "@/middlewares/async-handler";
import authService from "@/services/auth-service";
import { env } from "@/config/env";
import { SignupSessionPayload, verifyJwtToken } from "@packages/jwt";
import { sendResponse } from "@packages/http";
import { SendVerificationEmailResponse } from "@packages/contracts/auth";

/**
 * Handler for user signup verification send email.
 * Validates input & calls for send verification email service.
 */
export const sendVerificationEmailHandler = asyncHandler(
    async (req: Request, res: Response) => {
        
        const token = req.cookies[env.SIGNUP_SESSION_TOKEN_NAME];

        const payload: SignupSessionPayload = verifyJwtToken({
            token,
            secret: env.JWT_SIGNUP_SESSION_SECRET_KEY
        });

        // Getting signupSessionID from payload
        const signupSessionID = payload.signupSessionID;

        // Call service → either returns ServiceResponse OR throws ServiceException
        const { verificationEmailSent } = await authService.sendVerificationEmail({ signupSessionID });

        // Handler only returns response
        return sendResponse<SendVerificationEmailResponse>({
            res,
            success: true,
            statusCode: 200,
            message: "verification email sent",
            data: {
                verificationEmailSent
            },
            path: req.originalUrl,
        });
    }
);
