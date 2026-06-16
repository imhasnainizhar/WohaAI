import { env } from "@packages/env-ts";
import { asyncHandler } from "@/middlewares/async-handler";
import authService from "@/services/auth-service";
import { Request, Response } from "express";
import { sendResponse } from "@packages/http";
import { PrivilegedAccessTokenPayload, verifyJwtToken } from "@packages/security/jwt";
import { TwoFARequest, TwoFARequestSchema } from "@packages/contracts/auth";
import { ValidationError } from "@packages/errors";
import JwtTokenNames from "../../../../../packages/config/token-names.json";


export const enable2FAHandler = asyncHandler(
    async (req: Request, res: Response) => {
        const accessToken = req.cookies[JwtTokenNames.ACCESS_TOKEN]

        // Well, we are already managing errors inside out verifyJwtToken() helper.
        const payload = verifyJwtToken({
            token: accessToken,
            secret: env.JWT_AUTH_SECRET_KEY
        }) as PrivilegedAccessTokenPayload

        const userID = payload.sub
        const body: TwoFARequest = req.body

        const parsed = TwoFARequestSchema.safeParse(body)
        if(!parsed.success) throw new ValidationError("Invalid Totp, use allowed characters");

        await authService.enable2FA({ userID, token: parsed.data.totp })

        return sendResponse({
            res,
            success: true,
            statusCode: 200,
            message: "2FA Secret Generated",
            path: req.originalUrl
        })
    })