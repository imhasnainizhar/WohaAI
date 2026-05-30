import { asyncHandler } from "@/middlewares/async-handler";
import { SignupSessionPayload, verifyJwtToken } from "@packages/jwt";
import { env } from "@/config/env";
import authService from "@/services/auth-service";
import { sendResponse } from "@packages/http";
import { Request, Response } from "express";
import { ValidationError } from "@packages/errors";
import { ContinueWithEmailRequestSchema } from "@packages/contracts/auth";
import { ContinueWithEmailServiceResponse } from "@/services/signup/continue/email";

/**
 * Handler for user signup continue with email.
 * Validates input, verifies session token & calls for continue with email service.
 * After user get started with username then they are required for email, validated and cached
 * through this handler's service.
 */
export const continueWithEmailHandler = asyncHandler(async (req: Request, res: Response) => {
    // Verify signup session token
    const token = req.cookies[env.SIGNUP_SESSION_TOKEN_NAME];
    
    const payload: SignupSessionPayload = verifyJwtToken({
        token,
        secret: env.JWT_SIGNUP_SESSION_SECRET_KEY
    });

    // Getting signupSessionID from payload
    const signupSessionID = payload.signupSessionID;

    // Validate input using Zod schema
    const parsed = ContinueWithEmailRequestSchema.safeParse(req.body);
    if (!parsed.success) throw new ValidationError("Email is invalid", parsed.error);

    // Call service → either returns ServiceResponse OR throws ServiceException
    const { emailValidated } = await authService.continueWithEmail({
        signupSessionID,
        email: parsed.data.email
    });

    // Handler only returns response
    return sendResponse<ContinueWithEmailServiceResponse>({
        res,
        success: true,
        statusCode: 200,
        message: "",
        data: {
            emailValidated
        },
        path: req.originalUrl,
    });
});