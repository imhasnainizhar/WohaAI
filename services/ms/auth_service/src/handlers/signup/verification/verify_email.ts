import { Request, Response } from "express";
import { asyncHandler } from "@middlewares/async_handler";
import { sendResponse } from "@utils/response";
import { verifyUserEmailService } from "@services/signup/verification/confirm_email";

export const verifyUserEmailHandler = asyncHandler(
    async (req: Request, res: Response) => {
        // Call service → either returns ServiceResponse OR throws ServiceException
        const result = await verifyUserEmailService(req.body);

        // Controller only forwards response
        return sendResponse({
            res,
            ...result,
            path: req.originalUrl,
        });
    }
);
