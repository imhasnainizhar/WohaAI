import { asyncHandler } from "@middlewares/async_handler";
import { throwValidationError } from "@packages/shared/errors";
import continueWithEmailService from "@services/signup/continue/with_email";
import { SignupSessionPayload } from "@packages/shared/common";
import { EmailSignupSchema } from "@packages/shared/auth";
import { env } from "@config/env";
import jwt from "jsonwebtoken";
import { sendResponse } from "@packages/shared/utils";
import { throwSessionExpired } from "@packages/shared/errors";


/**
 * Handler for user signup continue with email.
 * Validates input, verifies session token & calls for continue with email service.
 * After user get started with username then they are required for email, validated and cached
 * through this handler's service.
 */
export const continueWithEmailHandler = asyncHandler(async (req, res) => {
    // Verify signup session token
    const token = req.cookies[env.SIGNUP_SESSION_TOKEN_NAME];
    const payload = jwt.verify(token, env.JWT_SIGNUP_SESSION_SECRET_KEY) as SignupSessionPayload;
    
    // If payload is not valid, throw session expired error
    if (!payload) throwSessionExpired();

    // Getting signupSessionID from payload
    const signupSessionID = payload.signupSessionID;

    // Validate input using Zod schema
    const parsed = EmailSignupSchema.safeParse(req.body);
    if (!parsed.success) return throwValidationError(parsed.error, "email");

    // Call service → either returns ServiceResponse OR throws ServiceException
    const result = await continueWithEmailService({ signupSessionID, email: parsed.data.email });

    // Handler only returns response
    return sendResponse({
        res,
        ...result,
        path: req.originalUrl,
    });
});