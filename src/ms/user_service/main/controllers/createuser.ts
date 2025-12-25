import { Request, Response } from "express";
import { createUserService } from "@services/createuser";
import { sendResponse, ServiceException, ServiceResponse } from "@utils/response";
import { logger } from "@utils/logger";
import { success, z } from "zod";
import { env } from "@config/env";
import { verifyJwtToken } from "@utils/jwt";

// Zod schema for input validation
const createUserSchema = z.object({
    username: z.string().min(3, "Username must be at least 3 characters"),
    userFirstName: z.string().min(1, "Display name is required"),
    userLastName: z.string().min(1, "Display name is required"),
    email: z.string().email("Invalid email"),
    hashedPassword: z.string(),
});

export const createUserController = async (req: Request, res: Response) => {
    try {
        const signupSessionToken = req.cookies?.[env.SIGNUP_SESSION_TOKEN_NAME];
        const session = verifyJwtToken(signupSessionToken, env.JWT_SIGNUP_SESSION_SECRET_KEY);
        const signupSessionID = session.signupSessionID
        if (!signupSessionID) {
            throw new ServiceException(
                ServiceResponse.error({
                    success: false,
                    statusCode: 401,
                    message: "signup session timed out",
                    errorType: "signup_sesion_expired"
                })
            )
        }
        // Validate input
        const parsed = createUserSchema.safeParse(req.body);
        if (!parsed.success) {
            const formattedErrors: Record<string, string[]> = {};
            parsed.error.issues.forEach((err) => {
                if (!err.path[0]) return;
                const key = err.path[0] as string;
                formattedErrors[key] = formattedErrors[key] || [];
                formattedErrors[key].push(err.message);
            });

            throw new ServiceException(
                ServiceResponse.error({
                    success: false,
                    statusCode: 400,
                    message: "Validation failed",
                    errors: formattedErrors,
                })
            )
        }

        const { username, userFirstName, userLastName, email, hashedPassword } = parsed.data
        // Call service
        const serviceResult = await createUserService({ username, userFirstName, userLastName, email, hashedPassword, signupSessionID });

        // Send response
        return sendResponse({
            res,
            ...serviceResult,
            path: req.path,
        });
    } catch (err: any) {
        if (err instanceof ServiceException) {
            logger.error({
                msg: "❌ createUserController error",
                message: err.message,
                stack: err.stack,
                name: err.name,
                cause: err.cause,
            });
            return sendResponse({
                res,
                ...err.response
            })
        }
        logger.error({
            msg: "❌ createUserController error",
            message: err.message,
            stack: err.stack,
            name: err.name,
            cause: err.cause,
        });

        return sendResponse({
            res,
            success: false,
            statusCode: 500,
            message: "Failed to create user",
            errorType: "internal_server_error",
            path: req.path,
        });
    }
};
