import { Request, Response } from "express";
import { asyncHandler } from "@/middlewares/async-handler";
import { sendResponse } from "@packages/http";
import { env } from "@packages/env-ts";
import {
  ChangePasswordRequest,
  ChangePasswordRequestSchema
} from "@packages/contracts/auth";

import {
  SessionExpiredError,
  ValidationError
} from "@packages/errors";

import authService from "@/services/auth-service";
import { verifyJwtToken } from "@packages/security/jwt";
import JwtTokenNames from "../../../../../packages/config/token-names.json";

export const completeChangePasswordHandler = asyncHandler(
  async (req: Request, res: Response) => {
    const token = req.cookies[JwtTokenNames.CHANGE_PASSWORD_TOKEN]

    // Issue to be opened to give generic type to verify token
    const payload = verifyJwtToken({
      token,
      secret: env.JWT_CHANGE_PASSWORD_SECRET_KEY
    })

    const body: ChangePasswordRequest = req.body;

    const parsed =
      ChangePasswordRequestSchema.safeParse(body);

    if (!parsed.success) {
      throw new ValidationError(
        "Password could not be validated.",
        parsed.error
      );
    }

    await authService.completeChangePassword({
      sessionID: payload.sub!,
      password: parsed.data.newConfirmPassword
    });

    return sendResponse({
      res,
      success: true,
      statusCode: 200,
      message: "Password changed successfully.",
      path: req.originalUrl
    });
  }
);