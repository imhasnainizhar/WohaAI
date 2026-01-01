import { asyncHandler } from '@middlewares/async_handler';
import { Request, Response } from "express";
import { sendResponse } from "@packages/shared/utils/response";
import { getStartedService } from "@services/signup/get_started";
import { GetStartedSchema } from "@packages/shared/auth/signup/schemas";
import { throwValidationError } from "@errors/auth";

export const getStartedHandler = asyncHandler(
    async (req: Request, res: Response) => {
        // Parsing request body
        const parsed = GetStartedSchema.safeParse(req.body);
        if (!parsed.success) {
            throwValidationError(parsed.error, "usernameOrEmail");
            // 🚨Using this return to make parsed.data undefined error silent🚨
            return;
        }

        // Call service → either returns ServiceResponse OR throws ServiceException
        const result = await getStartedService(parsed.data);

        // Controller only forwards response
        return sendResponse({
            res,
            ...result,
            path: req.originalUrl,
        });
    }
);