import { Request, Response } from "express";
import { asyncHandler } from "@/middlewares/async-handler";
import authService from "@/services/auth-service";
import { env } from "@wohaai/env-ts";
import { AuthSessionPayload, verifyJwtToken } from "@wohaai/security/jwt";
import { ExpressAdapter, sendResponse } from "@wohaai/http";
import tokenNames from "../../../../../../../packages/config/token-names.json";

/**
 * Handler for sending signup verification email to user.
 */
export const sendVerificationEmailHandler = asyncHandler(
    async (req: Request, res: Response) => {

        const token = req.cookies[tokenNames.AUTH_SESSION_TOKEN];

        const payload: AuthSessionPayload = verifyJwtToken({
            token,
            secret: env.JWT_AUTH_SECRET_KEY
        });

        // Getting authSessionID from payload
        const authSessionID = payload.sub;

        await authService.sendVerificationEmail({ authSessionID });

        // Handler only returns response
        return sendResponse({
            res: new ExpressAdapter(res),
            success: true,
            statusCode: 200,
            message: "verification email sent",
            path: req.originalUrl,
        });
    }
);
