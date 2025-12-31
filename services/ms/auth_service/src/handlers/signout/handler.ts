import { Request, Response } from "express";
import { asyncHandler } from "@middlewares/async_handler";
import { sendResponse } from "@utils/response";
import { signoutService } from "@services/signout/signout";
import { UserRefreshSessionPayload } from "@shared/domain/types/auth/common/types";
import { env } from "@config/env";
import jwt from "jsonwebtoken";

export const signoutHandler = asyncHandler(
    async (req: Request, res: Response) => {
        const userSessionToken = req.cookies[env.REFRESH_TOKEN_NAME];
        const payload = jwt.verify(userSessionToken, env.JWT_REFRESH_SECRET_KEY) as UserRefreshSessionPayload;
        const userID = payload.userID;
        const userSessionID = payload.userSessionID;
        // Call service → either returns ServiceResponse OR throws ServiceException
        const result = await signoutService(userID, userSessionID);

        // Controller only forwards response
        return sendResponse({
            res,
            ...result,
            path: req.originalUrl,
        });
    }
);
