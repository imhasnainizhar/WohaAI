import { Request, Response } from "express";
import { asyncHandler } from "@/middlewares/async-handler";
import { sendResponse } from "@packages/http";
import { env } from "@/config/env";

import {
    AccessSessionExpiredError,
    ValidationError
} from "@packages/errors";

import authService from "@/services/auth-service";
import { AccessTokenPayload, verifyJwtToken } from "@packages/jwt";
import { ChangePasswordServiceResponse } from '../services/change-password';
import { ChangePasswordRequest, ChangePasswordRequestSchema } from "@packages/contracts/auth";

export const changePasswordHandler = asyncHandler(
  async (req: Request, res: Response) => {
    const token = req.cookies[env.ACCESS_TOKEN_NAME]

    // Issue to be opened to give generic type to verify token
    const payload = verifyJwtToken({
      token,
      secret: env.JWT_FORGOT_PASSWORD_SESSION_SECRET_KEY
    }) as AccessTokenPayload;

    if (!payload) throw new AccessSessionExpiredError();

    const body: ChangePasswordRequest = req.body;

    const parsed =
      ChangePasswordRequestSchema.safeParse(body);

    if (!parsed.success) {
      throw new ValidationError(
        "Password could not be validated.",
        parsed.error
      );
    }

    const {
      passwordChanged
    } = await authService.changePassword({
      userID: payload.sub!,
      oldPassword: parsed.data.oldPassword,
      newPassword: parsed.data.newConfirmPassword
    });

    return sendResponse<ChangePasswordServiceResponse>({
      res,
      success: true,
      statusCode: 200,
      data: {
        passwordChanged
      },
      message: "Password changed successfully.",
      path: req.originalUrl
    });
  }
);