import { Request, Response } from "express";
import { asyncHandler } from "@/middlewares/async-handler";
import { ExpressAdapter, sendResponse } from "@wohaai/http";
import { env } from "@wohaai/env-ts";
import {
  TChangePasswordRequest,
  ChangePasswordRequestSchema
} from "@wohaai/validations";

import {
  SessionExpiredError,
  ValidationError
} from "@wohaai/errors";

import authService from "@/services/auth-service";
import { verifyJwtToken } from "@wohaai/security/jwt";
import JwtTokenNames from "../../../../../../packages/config/token-names.json";

export const completeChangePasswordHandler = asyncHandler(
  async (req: Request, res: Response) => {
    const token = req.cookies[JwtTokenNames.CHANGE_PASSWORD_TOKEN]

    // Issue to be opened to give generic type to verify token
    const payload = verifyJwtToken({
      token,
      secret: env.JWT_AUTH_SECRET_KEY
    })

    const body: TChangePasswordRequest = req.body;

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
      res: new ExpressAdapter(res),
      success: true,
      statusCode: 200,
      message: "Password changed successfully.",
      path: req.originalUrl
    });
  }
);