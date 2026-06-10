import { env } from "@/config/env";
import { asyncHandler } from "@/middlewares/async-handler";
import authService from "@/services/auth-service";
import { Generate2FASecretServiceResponse } from "@/services/two-fa/generate";
import { Request, Response } from "express";
import { sendResponse } from "@packages/http";
import { PrivilegedAccessTokenPayload, verifyJwtToken } from "@packages/jwt";


export const generate2FASecretHandler = asyncHandler(
    async (req: Request, res: Response) => {
        const token = req.cookies[env.PRIVATE_ACCESS_TOKEN_NAME]

        // Well, we are already managing errors inside out verifyJwtToken() helper.
        const payload = verifyJwtToken({
            token,
            secret: env.JWT_PRIVATE_ACCESS_SECRET_KEY
        }) as PrivilegedAccessTokenPayload

        const id = payload.sub

        const { secret, otpauthURL } =
            await authService.generate2FASecret({ id })

        return sendResponse<Generate2FASecretServiceResponse>({
            res,
            success: true,
            statusCode: 200,
            message: "2FA Secret Generated",
            data: {
                secret,
                otpauthURL
            },
            path: req.originalUrl
        })
    })