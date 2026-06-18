import { Request, Response } from "express";
import { sendResponse } from "@wohaai/http";
import { userService } from "@/services/user-service";
import { userLogger as logger } from "@wohaai/telemetry";
import { env } from "@wohaai/env-ts";
import { AuthSessionPayload, verifyJwtToken } from "@wohaai/security/jwt";
import { AccessSessionExpiredError, SessionExpiredError, ValidationError } from "@wohaai/errors";
import { CreateUserSchema } from '@wohaai/validations';
import { asyncHandler } from '../middlewares/async-handler';
import tokenNames from "../../../../packages/config/token-names.json"

export const createUserHandler = asyncHandler(async (req: Request, res: Response) => {
    // We are using signupToken cuz User Provision is done by auth service request through User Provision Client under Signup session. User do not request directly for provisioning.
    const signupSessionToken = req.cookies?.[tokenNames.AUTH_SESSION_TOKEN];
    verifyJwtToken({
        token: signupSessionToken,
        secret: env.JWT_AUTH_SECRET_KEY
    }) as AuthSessionPayload;

    // Validate input
    const parsed = CreateUserSchema.safeParse(req.body);
    if (!parsed.success) {

        logger.warn("Data integrity danger, auth service sent wrong invalid User Provision Request")
        throw new ValidationError("Validation error at User Provision. Check for data integrity.", parsed.error)
    }

    const { username, email, hashedPassword } = parsed.data
    // Call service
    const result = await userService.createUser({
        username,
        email,
        hashedPassword
    });

    // Send response
    return sendResponse<{ userCreated: boolean }>({
        res,
        success: true,
        statusCode: 200,
        message: "user created",
        data: {
            userCreated: result.userCreated
        },
        path: req.path,
    });
})