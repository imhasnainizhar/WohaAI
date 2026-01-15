import { SignupSessionPayload } from '@packages/shared/common';
import { Request, Response } from "express";
import { asyncHandler } from "@middlewares/async_handler";
import { sendResponse } from "@packages/shared/utils";
import { completeSignupService } from "@services/signup/complete";
import { CompleteSignupSchema } from "@packages/shared/auth";
import { CompleteSignupDTO } from "@packages/shared/auth";
import { throwValidationError } from "@packages/shared/errors";
import { env } from "@config/env";
import jwt from "jsonwebtoken";
import { throwSessionExpired } from '@packages/shared/errors';

/**
 * Handler for user signup complete.
 * Validates input, verifies session token & calls for complete signup service.
 * This validates user more info & caches it so User Creation API creates user successfully.
 */
export const completeSignupHandler = asyncHandler(
    async (req: Request, res: Response) => {
        // Getting signupSessionID through JWT Verification
        const token = req.cookies[env.SIGNUP_SESSION_TOKEN_NAME];
        const payload = jwt.verify(token, env.JWT_SIGNUP_SESSION_SECRET_KEY) as SignupSessionPayload;

        // If payload is not valid, throw session expired error
        if (!payload) throwSessionExpired();

        // Getting signupSessionID from payload
        const signupSessionID = payload.signupSessionID;

        // Validate input using Zod schema
        const parsed = CompleteSignupSchema.safeParse(req.body);

        if (!parsed.success) {
            throw throwValidationError(parsed.error, "displayName");
        }

        // At this point TS knows parsed is successful
        const data = parsed.data; // type is now CompleteSignupType
        const { firstName, lastName, password, dateOfBirth } = data;

        // Construct DTO
        const dto: CompleteSignupDTO = {
            signupSessionID,
            firstName,
            lastName,
            password,
            dateOfBirth,
        };

        // Call service → either returns ServiceResponse OR throws ServiceException
        const result = await completeSignupService(dto);

        // Controller only forwards response
        return sendResponse({
            res,
            ...result,
            path: req.originalUrl,
        });
    }
);
