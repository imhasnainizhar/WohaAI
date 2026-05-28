import { asyncHandler } from '@/middlewares/async-handler';
import { Request, Response } from "express";
import { buildCookie, sendResponse } from "@packages/http";
import authService from '@/services/auth-service';
import { SignupInitRequestSchema, SignupInitRequest } from "@packages/contracts/auth";
import { ValidationError } from '@packages/errors';
import { env } from '@/config/env';
import { exp } from '@/config/exp';

/**
 * Handler for user signup get started.
 * Validates input and calls for get started service.
 * Then service create signup session if user is new.
 */
export const signupInitHandler = asyncHandler(
    async (req: Request, res: Response) => {
        // Parsing request body
        // type: username | email is ignored as ican be verified through schema again.
        const usernameOrEmail = {
            value: req.body.usernameOrEmail.value,
        };

        const parsed = SignupInitRequestSchema.safeParse({usernameOrEmail: usernameOrEmail.value});
        if (!parsed.success) {
            throw new ValidationError(
                "Given credentials could not be validated, please use allowed characters.",
                parsed.error
            );
        }

        // Call service → either returns ServiceResponse OR throws ServiceException
        const {
            identifierType,
            identifier,
            already_exists,
            signupSessionToken        
        } = await authService.signupInit(parsed.data);

        const signupSessionCookie = buildCookie({
            name: env.SIGNUP_SESSION_TOKEN_NAME,
            value: signupSessionToken,
            options: {
                httpOnly: true,
                secure: env.NODE_ENV === "production",
                sameSite: "lax",
                path: "/",
                maxAge: exp.SIGNUP_SESSION_COOKIE
            }
        })

        // Controller only forwards response
        return sendResponse({
            res,
            success: true,
            statusCode: 200,
            data: {
                identifierType,
                identifier,
                already_exists,    
            },
            message: "signup init successful",
            path: req.originalUrl,
            cookies: [ signupSessionCookie ]
        });
    }
);