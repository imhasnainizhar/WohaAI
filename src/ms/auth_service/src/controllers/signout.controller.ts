import { Request, Response } from "express";
import { signoutService } from "@services/signout.service";
import { sendResponse } from "@utils/api_response";
import { env } from "@config/env.config";
import { logger } from "@utils/logger";

/**
 * @controller signoutController
 * Handles Express response & cookies for signout flow.
 */
export const signoutController = async (req: Request, res: Response) => {
    try {
        const userID = req.body.userID;
        logger.warn({
            message: "⚠️ [SIGNOUT] Missing userID in request body",
            path: req.path,
        });
        if (userID) {
            return sendResponse({
                res,
                success: false,
                message: "Missing user ID",
                statusCode: 400,
                errorType: "bad_request",
                path: req.path,
            });
        }

        // Calling Service for signout
        await signoutService(userID);

        const sameSite: "strict" | "lax" =
            env.NODE_ENV === "production" ? "strict" : "lax";

        // 🍪 Clear all authentication cookies
        /**
         * Clear the JWT cookie by setting an empty value and maxAge 0.
         * This ensures the token is invalidated on the client-side.
         * HttpOnly and Secure flags are kept for security.
         */

        const cookieOptions = {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite,
            path: "/",
            maxAge: 0,
        } as const;

        // Setting cookies to clear all cookie sessions.
        res.cookie("__woahai_acc_t", "", cookieOptions);
        res.cookie("__woahai_ref_t", "", cookieOptions);
        res.cookie("__woahai_private_acc_t", "", cookieOptions);
    } catch (err: any) {
        // Error Handling
        logger.error(
            { message: "❌ [SIGNOUT] Signout failed", path: req.path, error: err.message }
        );

        switch (err.name) {
            case "UserNotFound":
                return sendResponse({
                    res,
                    success: false,
                    message: "User not found",
                    statusCode: 404,
                    errorType: "user_not_found",
                    path: req.path,
                });

            default:
                return sendResponse({
                    res,
                    success: false,
                    message: "Internal server error during signout",
                    statusCode: 500,
                    errorType: "internal_server_error",
                    path: req.path,
                });
        }
    }
};
