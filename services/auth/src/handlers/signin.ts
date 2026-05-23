import { Request, Response } from "express";
import { asyncHandler } from "../middlewares/async_handler";
import { sendResponse } from "@packages/shared/utils";
import { signinService } from "@services/signin";
import { SigninSessionPayload } from "@packages/shared/common";
import { env } from "@config/env";
import jwt from "jsonwebtoken";
import { SigninSchema } from "@packages/shared/auth/signin/schemas";
import { throwSessionExpired, throwValidationError } from "@packages/shared/errors";
import { getClientData } from "../helpers/get_client_data";

/**
 * Handler for user sign-in.
 * Validates input, verifies session token & calls for signin service.
 */
export const signinHandler = asyncHandler(
    async (req: Request, res: Response) => {
        // Verify signin session token
        const signinSessionToken = req.cookies[env.SIGNIN_SESSION_TOKEN_NAME];
        const payload = jwt.verify(signinSessionToken, env.JWT_SIGNIN_SESSION_SECRET_KEY) as SigninSessionPayload;

        // If payload is not valid, throw session expired error
        if (!payload) throwSessionExpired();

        // Validate request body
        const parsed = SigninSchema.safeParse(req.body);
        if (!parsed.success) return throwValidationError(parsed.error, "signin");

        // Get client data for creating device signin record in DB
        const clientData = getClientData(req);

        // Call service → either returns ServiceResponse OR throws ServiceException
        const result = await signinService({
            usernameOrEmail: parsed.data.usernameOrEmail,
            password: parsed.data.password,
            clientData,
        });

        // Controller only forwards response
        return sendResponse({
            res,
            ...result,
            path: req.originalUrl,
        });
    }
);
