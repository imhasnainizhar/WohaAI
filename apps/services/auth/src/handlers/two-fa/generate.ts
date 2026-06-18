import { env } from "@wohaai/env-ts";
import { asyncHandler } from "@/middlewares/async-handler";
import authService from "@/services/auth-service";
import { Request, Response } from "express";
import { sendResponse } from "@wohaai/http";
import { verifyJwtToken, AccessTokenPayload } from "@wohaai/security/jwt";
import JwtTokenNames from "../../../../../../packages/config/token-names.json";
import { Generate2FASecretResponse } from "@wohaai/types";


export const generate2FASecretHandler = asyncHandler(
    async (req: Request, res: Response) => {
        const token = req.cookies[JwtTokenNames.ACCESS_TOKEN]

        // Well, we are already managing errors inside out verifyJwtToken() helper.
        const payload = verifyJwtToken({
            token,
            secret: env.JWT_AUTH_SECRET_KEY
        }) as AccessTokenPayload

        const userID = payload.sub

        const { secret, otpauthURL } =
            await authService.generate2FASecret({ userID })

        return sendResponse<Generate2FASecretResponse>({
            res,
            success: true,
            statusCode: 200,
            data: {
                secret,
                otpauthURL
            },
            message: "2FA Secret Generated",
            path: req.originalUrl
        })
    })