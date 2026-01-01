import { UsernameSignupSchema } from "@packages/shared/auth/signup/schemas";
import { throwValidationError } from "@errors/auth";
import continueWithUsernameService from "@services/signup/continue/with_username";
import { asyncHandler } from "@middlewares/async_handler";
import { env } from "@config/env";
import jwt from "jsonwebtoken";
import { SignupSessionPayload } from "@packages/shared/common/auth/jwt/types";
import { sendResponse } from "@packages/shared/utils/response";
import { throwSessionExpired } from "@packages/shared/errors/auth/errors";

/**
 * Handler for user signup continue with username.
 * Validates input, verifies session token & calls for continue with username.
 * After user get started with email then they are required for username, validated and cached
 * through this handler's service.
 */
export const continueWithUsernameHandler = asyncHandler(async (req, res) => {
    // Verify signup session token
    const token = req.cookies[env.SIGNUP_SESSION_TOKEN_NAME];
    const payload = jwt.verify(token, env.JWT_SIGNUP_SESSION_SECRET_KEY) as SignupSessionPayload;

    // If payload is not valid, throw session expired error
    if (!payload) throwSessionExpired();

    // Getting signupSessionID from payload
    const signupSessionID = payload.signupSessionID;

    // Validate input using Zod schema
    const parsed = UsernameSignupSchema.safeParse(req.body);
    if (!parsed.success) return throwValidationError(parsed.error, "username");

    // Call service → either returns ServiceResponse OR throws ServiceException
    const result = await continueWithUsernameService({ signupSessionID, username: parsed.data.username });

    // Handler only returns response
    return sendResponse({
        res,
        ...result,
        path: req.originalUrl,
    });
});