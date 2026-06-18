import authService from "@/services/auth-service";
import { asyncHandler } from "@/middlewares/async-handler";
import { env } from "@wohaai/env-ts";
import { AuthSessionPayload, verifyJwtToken } from "@wohaai/security/jwt";
import { sendResponse } from "@wohaai/http";
import { ContinueWithUsernameRequest, ContinueWithUsernameRequestSchema } from "@wohaai/validations";
import { ValidationError } from "@wohaai/errors";
import tokenNames from "../../../../../packages/config/token-names.json";

/**
 * Handler for user signup continue with username.
 * Validates input, verifies session token & calls for continue with username.
 * After user get started with email then they are required for username, validated and cached
 * through this handler's service.
 */
export const signupUsernameValidationHandler =
    asyncHandler(async (req, res) => {
        // Verify auth session token
        const token = req.cookies[tokenNames.AUTH_SESSION_TOKEN];
        const payload: AuthSessionPayload = verifyJwtToken({
            token,
            secret: env.JWT_AUTH_SECRET_KEY
        });

        const body: ContinueWithUsernameRequest = req.body

        // Validate input using Zod schema
        const parsed =
            ContinueWithUsernameRequestSchema.safeParse(body);

        if (!parsed.success) throw new ValidationError("Username is invalid", parsed.error);

        // Call service → either returns ServiceResponse OR throws ServiceException
        await authService.signupUsernameValidation({
            authSessionID: payload.sub,
            username: parsed.data.username
        });

        // Handler only returns response
        return sendResponse({
            res,
            success: true,
            statusCode: 200,
            message: "Username successfully validated",
            path: req.originalUrl,
        });
    }
    );