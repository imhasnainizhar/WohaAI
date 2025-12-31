import { Request, Response } from "express";
import { asyncHandler } from "@middlewares/async_handler";
import { sendResponse } from "@utils/response";
import { sendVerificationEmailService } from "@services/signup/verification/send_email";

export const sendVerificationEmailHandler = asyncHandler(
    async (req: Request, res: Response) => {
        // Call service → either returns ServiceResponse OR throws ServiceException
        const result = await sendVerificationEmailService(req.body);

        // Controller only forwards response
        return sendResponse({
            res,
            ...result,
            path: req.originalUrl,
        });
    }
);
