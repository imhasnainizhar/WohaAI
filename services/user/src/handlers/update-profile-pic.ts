import { Request, Response } from "express";
import { sendResponse } from "@packages/http";
import { userService } from "@/services/user-service";
import { userLogger as logger } from "@packages/observability";
import { env } from "@packages/env-ts";
import { AccessTokenPayload, verifyJwtToken } from "@packages/security/jwt";
import { AccessSessionExpiredError, ValidationError } from "@packages/errors";
import { CreateUserSchema, UpdateProfilePicRequestSchema } from '@packages/contracts/user';
import { asyncHandler } from '../middlewares/async-handler';
import tokenNames from "../../../../packages/config/token-names.json"

export const updateProfilePicHandler = asyncHandler(async (req: Request, res: Response) => {
    const accessToken = req.cookies?.[tokenNames.ACCESS_TOKEN];
    const payload = verifyJwtToken({
        token: accessToken,
        secret: env.JWT_AUTH_SECRET_KEY
    }) as AccessTokenPayload;

    // sub is user id, as per standards
    const userID = payload.sub
    if (!userID) throw new AccessSessionExpiredError()

    // Validate input
    const parsed = UpdateProfilePicRequestSchema.safeParse(req.body);
    if (!parsed.success) {
        throw new ValidationError("Invalid User Profile Pic Data", parsed.error)
    }

    const { profilePicURI } = parsed.data
    // Call service

    await userService.updateProfilePic({
        userID,
        profilePicURI
    });

    // Send response
    return sendResponse<void>({
        res,
        success: true,
        statusCode: 200,
        message: "user profile pic updated",
        path: req.path,
    });
})