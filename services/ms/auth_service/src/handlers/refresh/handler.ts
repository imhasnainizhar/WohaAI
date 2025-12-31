import { asyncHandler } from "@middlewares/async_handler";
import { ClientData } from "@domain/types/session";
import { getClientData } from "@utils/get_client_data";
import { refreshToken } from "@services/refresh/refresh_token";
import { sendResponse, ServiceException, ServiceResponse } from "@utils/response";
import { Request, Response } from "express";


export const refreshTokenHandler = asyncHandler(
    async (req: Request, res: Response) => {
        const clientData = getClientData(req);
        if (!clientData) {
            throw new ServiceException(
                ServiceResponse.error({
                    success: false,
                    statusCode: 400,
                    message: "Failed to get client information.",
                    errorType: "client_error",
                })
            );
        }
        const { userIPAddress }: ClientData = clientData;
        // Call service → either returns ServiceResponse OR throws ServiceException
        const result = await refreshToken({ cookies: req.cookies, userIPAddress });

        // Controller only forwards response
        return sendResponse({
            res,
            ...result,
            path: req.originalUrl,
        });
    }
);
