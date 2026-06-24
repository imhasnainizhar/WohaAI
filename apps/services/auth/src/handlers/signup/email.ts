import { asyncHandler } from "@/middlewares/async-handler";
import { AuthSessionPayload, verifyJwtToken } from "@wohaai/security/jwt";
import { env } from "@wohaai/env-ts";
import authService from "@/services/auth-service";
import { ExpressAdapter, sendResponse } from "@wohaai/http";
import { Request, Response } from "express";
import { ValidationError } from "@wohaai/errors";
import { TContinueWithEmailRequest, ContinueWithEmailRequestSchema } from "@wohaai/validations";
import tokenNames from "../../../../../../packages/config/token-names.json"

/**
 * Handler for user signup continue with email.
 * Validates input, verifies session token & calls for continue with email service.
 * After user get started with username then they are required for email, validated and cached
 * through this handler's service.
 */
export const signupEmailValidationHandler =
    asyncHandler(async (req: Request, res: Response) => {
        // Verify auth session token
        const token = req.cookies[tokenNames.AUTH_SESSION_TOKEN];
        const payload: AuthSessionPayload = verifyJwtToken({
            token,
            secret: env.JWT_AUTH_SECRET_KEY
        });

        // Getting authSessionID from payload
        const authSessionID = payload.sub;

        const body: TContinueWithEmailRequest = req.body

        // Validate input using Zod schema
        const parsed = ContinueWithEmailRequestSchema.safeParse(body);
        if (!parsed.success) throw new ValidationError("Email is invalid", parsed.error);

        await authService.signupEmailValidation({
            authSessionID,
            email: parsed.data.email
        });

        // Handler only returns response
        return sendResponse({
            res: new ExpressAdapter(res),
            success: true,
            statusCode: 200,
            message: "Email validated successfully",
            path: req.originalUrl,
        });
    }
    );