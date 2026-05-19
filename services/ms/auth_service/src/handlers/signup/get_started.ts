import { asyncHandler } from '@middlewares/async_handler';
import { Request, Response } from "express";
import { sendResponse } from "@packages/shared/utils";
import { getStartedService } from "@services/signup/get_started";
import { GetStartedSchema } from "@packages/shared/auth";
import { throwValidationError } from "@packages/shared/errors";

/**
 * Handler for user signup get started.
 * Validates input and calls for get started service.
 * Then service create signup session if user is new.
 */
export const getStartedHandler = asyncHandler(
    async (req: Request, res: Response) => {
        // Parsing request body
        const usernameOrEmail = {
            value: req.body.usernameOrEmail.value,
            // type: username | email is ignored as it can be verified through schema again.
        };
        const parsed = GetStartedSchema.safeParse({usernameOrEmail: usernameOrEmail.value});
        if (!parsed.success) {
            throwValidationError(parsed.error, "usernameOrEmail");
            // 🚨Using this return to silent parsed.data undefined error🚨
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