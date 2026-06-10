import { env } from "@/config/env";
import { asyncHandler } from "@/middlewares/async-handler";
import authService from "@/services/auth-service";
import { Request, Response } from "express";
import { sendResponse } from "@packages/http";
import { PrivilegedAccessTokenPayload, verifyJwtToken } from "@packages/jwt";
import { Verify2FAServiceResponse } from "@/services/two-fa/verify";
import { TwoFARequest, TwoFARequestSchema } from "@packages/contracts/auth";
import { ValidationError } from "@packages/errors";


export const verify2FAHandler = asyncHandler(
    async (req: Request, res: Response) => {
        const accessToken = req.cookies[env.PRIVATE_ACCESS_TOKEN_NAME]

        // Well, we are already managing errors inside out verifyJwtToken() helper.
        const payload = verifyJwtToken({
            token: accessToken,
            secret: env.JWT_PRIVATE_ACCESS_SECRET_KEY
        }) as PrivilegedAccessTokenPayload

        const id = payload.sub
        const body: TwoFARequest = req.body

        const parsed = TwoFARequestSchema.safeParse(body)
        if (!parsed.success) throw new ValidationError("Invalid Totp, use allowed characters");

        const { verified } =
            await authService.verify2FA({ id, token: parsed.data.totp })

        return sendResponse<Verify2FAServiceResponse>({
            res,
            success: true,
            statusCode: 200,
            message: "2FA Verified",
            data: {
                verified
            },
            path: req.originalUrl
        })
    })