import { Request, Response } from "express";
import { sendResponse } from "@wohaai/http";
import { ExpressAdapter } from "@wohaai/http";
import { userService } from "@/services/user-service";
import { userLogger as logger } from "@wohaai/telemetry";
import { env } from "@wohaai/env-ts";
import { AuthSessionPayload, verifyJwtToken } from "@wohaai/security/jwt";
import { SessionExpiredError, ValidationError } from "@wohaai/errors";
import { CreateUserRequestSchema } from '@wohaai/validations';
import { asyncHandler } from '../middlewares/async-handler';
import tokenNames from "../../../../../packages/config/token-names.json"
import { CreateUserServiceResponse } from "../services/create-user";
import { UserCreatedResponse } from "@wohaai/types";

export const createUserHandler = asyncHandler(async (req: Request, res: Response) => {
    // For service-to-service communication, token is passed via Authorization header
    // For browser requests, token is in cookies
    const authHeader = req.headers.authorization;
    const signupSessionToken = authHeader?.startsWith('Bearer ')
        ? authHeader.substring(7)
        : req.cookies?.[tokenNames.AUTH_SESSION_TOKEN];

    if (!signupSessionToken) {
        throw new SessionExpiredError();
    }

    verifyJwtToken({
        token: signupSessionToken,
        secret: env.JWT_AUTH_SECRET_KEY
    }) as AuthSessionPayload;

    // Validate input
    const parsed = CreateUserRequestSchema.safeParse(req.body);
    if (!parsed.success) {

        logger.warn("Data integrity danger, auth service sent wrong invalid User Provision Request")
        throw new ValidationError("Validation error at User Provision. Check for data integrity.", parsed.error)
    }

    const { username, email, hashedPassword } = parsed.data

    // Call service
    const result: CreateUserServiceResponse = await userService.createUser({
        username,
        email,
        hashedPassword
    });

    logger.info({
        message: "User created successfully",
        username,
        email,
        userID: result.userID,
    });

    // Send response
    return sendResponse<UserCreatedResponse>({
        res: new ExpressAdapter(res),
        success: true,
        statusCode: 200,
        message: "user created",
        data: {
            userID: result.userID,
            username: result.username,
            email: result.email
        },
        path: req.path,
    });
})