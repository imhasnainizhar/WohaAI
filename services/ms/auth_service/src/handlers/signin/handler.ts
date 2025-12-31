import { Request, Response } from "express";
import { asyncHandler } from "../../middlewares/async_handler";
import { sendResponse } from "@utils/response";
import { signinService } from "@services/signin/complete";
import { SigninSessionPayload } from "@shared/domain/types/auth/signin/types";
import { env } from "@config/env";
import jwt from "jsonwebtoken";
import { SignInSchema } from "@shared/zod/schemas/auth/signin/schema";
import { throwValidationError } from "@errors/auth";

export const signinHandler = asyncHandler(
    async (req: Request, res: Response) => {
        const signinSessionToken = req.cookies[env.SIGNIN_SESSION_TOKEN_NAME];
        const payload = jwt.verify(signinSessionToken, env.SIGNIN_SESSION_TOKEN_NAME) as SigninSessionPayload;

        const parsed = SignInSchema.safeParse(req.body);
        if (!parsed.success) return throwValidationError(parsed.error, "signin");

        // Call service → either returns ServiceResponse OR throws ServiceException
        const result = await signinService(payload.signinSessionID, parsed.data);

        // Controller only forwards response
        return sendResponse({
            res,
            ...result,
            path: req.originalUrl,
        });
    }
);
