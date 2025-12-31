import { SignupSessionPayload } from '@shared/domain/types/auth/signup/types';
import { Request, Response } from "express";
import { asyncHandler } from "../../middlewares/async_handler";
import { sendResponse } from "@utils/response";
import { completeSignupService } from "@services/signup/complete_signup";
import { CompleteSignupSchema, CompleteSignupType } from "@shared/zod/schemas/auth/signup/complete_signup";
import { throwValidationError } from "@errors/auth";
import { env } from "@config/env";
import jwt from "jsonwebtoken";
import { CompleteSignupDTO } from '@shared/domain/types/auth/signup/dto';

export const completeSignupHandler = asyncHandler(
    async (req: Request, res: Response) => {
        const token = req.cookies[env.SIGNUP_SESSION_TOKEN_NAME];
        const payload = jwt.verify(token, env.JWT_SIGNUP_SESSION_SECRET_KEY) as SignupSessionPayload;
        const signupSessionID = payload.signupSessionID;

        // Validate input using Zod schema
        const parsed = CompleteSignupSchema.safeParse(req.body);

        if (!parsed.success) {
            throw throwValidationError(parsed.error, "displayName");
        }

        // At this point TS knows parsed is successful
        const data = parsed.data; // type is now CompleteSignupType
        const { firstName, lastName, password, confirmPassword, dateOfBirth } = data;

        // Construct DTO
        const dto: CompleteSignupDTO = {
            signupSessionID,
            firstName,
            lastName,
            password,
            confirmPassword,
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
