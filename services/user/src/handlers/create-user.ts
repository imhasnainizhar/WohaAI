import { Request, Response } from "express";
import { sendResponse } from "@packages/http";
import { userService } from "@/services/user-service";
import { userLogger as logger } from "@packages/observability";
import { env } from "@/config/env";
import { SignupSessionPayload, verifyJwtToken } from "@packages/jwt";
import { AccessSessionExpiredError, SessionExpiredError, ValidationError } from "@packages/errors";
import { CreateUserSchema } from '@packages/contracts/user';
import { asyncHandler } from '../middlewares/async-handler';

export const createUserHandler = asyncHandler(async (req: Request, res: Response) => {
    // We are using signupToken cuz User Provision is done by auth service request through User Provision Client under Signup session. User do not request directly for provisioning.
    const signupSessionToken = req.cookies?.[env.SIGNUP_SESSION_TOKEN_NAME];
    const payload = verifyJwtToken({
        token: signupSessionToken,
        secret: env.JWT_SIGNUP_SESSION_SECRET_KEY
    }) as SignupSessionPayload;

    // Validate input
    const parsed = CreateUserSchema.safeParse(req.body);
    if (!parsed.success) {
        
        logger.warn("Data integrity danger, auth servicce sent wrong invalid User Provision Request")
        throw new ValidationError("Validation error at User Provision. Check for data integrity.", parsed.error)
    }

    const { username, firstName, lastName, email, hashedPassword } = parsed.data
    // Call service
    const result = await userService.createUser({
        username,
        firstName,
        lastName,
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