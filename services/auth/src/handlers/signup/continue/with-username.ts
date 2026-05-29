import authService from "@/services/auth-service";
import { asyncHandler } from "@/middlewares/async-handler";
import { env } from "@/config/env";
import { SignupSessionPayload, verifyJwtToken } from "@packages/jwt";
import { sendResponse } from "@packages/http";
import { ContinueWithUsernameRequestSchema, ContinueWithUsernameResponse } from "@packages/contracts/auth";
import { ValidationError } from "@packages/errors";

/**
 * Handler for user signup continue with username.
 * Validates input, verifies session token & calls for continue with username.
 * After user get started with email then they are required for username, validated and cached
 * through this handler's service.
 */
export const continueWithUsernameHandler = asyncHandler(async (req, res) => {
    // Verify signup session token
    const token = req.cookies[env.SIGNUP_SESSION_TOKEN_NAME];

    const payload: SignupSessionPayload = verifyJwtToken({
        token,
        secret: env.JWT_SIGNUP_SESSION_SECRET_KEY
    });

    // Validate input using Zod schema
    const parsed = 
        ContinueWithUsernameRequestSchema.safeParse(req.body);

    if (!parsed.success) throw new ValidationError("Username is invalid", parsed.error);

    // Call service → either returns ServiceResponse OR throws ServiceException
    const { usernameValidated } = await authService.continueWithUsername({
        signupSessionID: payload.signupSessionID,
        username: parsed.data.username
    });

    // Handler only returns response
    return sendResponse<ContinueWithUsernameResponse>({
        res,
        success: true,
        statusCode: 200,
        message: "Username successfully validated",
        data: {
            usernameValidated
        },
        path: req.originalUrl,
    });
});