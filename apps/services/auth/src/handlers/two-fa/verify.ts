import { env } from "@wohaai/env-ts";
import { asyncHandler } from "@/middlewares/async-handler";
import authService from "@/services/auth-service";
import { Request, Response } from "express";
import { sendResponse } from "@wohaai/http";
import { verifyJwtToken, AccessTokenPayload } from "@wohaai/security/jwt";
import { TTwoFARequest, TwoFARequestSchema } from "@wohaai/validations";
import { ValidationError } from "@wohaai/errors";
import JwtTokenNames from "../../../../../../packages/config/token-names.json";


export const verify2FAHandler = asyncHandler(
    async (req: Request, res: Response) => {
        const accessToken = req.cookies[JwtTokenNames.ACCESS_TOKEN]

        // Well, we are already managing errors inside out verifyJwtToken() helper.
        const payload = verifyJwtToken({
            token: accessToken,
            secret: env.JWT_AUTH_SECRET_KEY
        }) as AccessTokenPayload

        const userID = payload.sub
        const body: TTwoFARequest = req.body

        const parsed = TwoFARequestSchema.safeParse(body)
        if (!parsed.success) throw new ValidationError("Invalid Totp, use allowed characters");

        await authService.verify2FA({ userID, token: parsed.data.totp })

        return sendResponse({
            res,
            success: true,
            statusCode: 200,
            message: "2FA Verified",
            path: req.originalUrl
        })
    })