import { Request, Response } from "express";
import { asyncHandler } from "@/middlewares/async-handler";
import { sendResponse } from "@packages/http";
import { env } from "@/config/env";
import {
  ChangeForgottenPasswordRequestSchema
} from "@packages/contracts/auth";

import {
  SessionExpiredError,
  ValidationError
} from "@packages/errors";

import authService from "@/services/auth-service";
import { verifyJwtToken } from "@packages/jwt";


interface ChangeForgottenPasswordResponse {
  forgottenPasswordChanged: boolean
}

export const changeForgottenPasswordHandler = asyncHandler(
  async (req: Request, res: Response) => {
    const token = req.cookies[env.FORGOT_PASSWORD_SESSION_TOKEN_NAME]

    // Issue to be opened to give generic type to verify token
    const payload = verifyJwtToken({
      token,
      secret: env.JWT_FORGOT_PASSWORD_SESSION_SECRET_KEY
    })

    if (!payload) throw new SessionExpiredError()

    const body = req.body;

    const parsed =
      ChangeForgottenPasswordRequestSchema.safeParse(body);

    if (!parsed.success) {
      throw new ValidationError(
        "Password could not be validated.",
        parsed.error
      );
    }

    const {
      forgottenPasswordChanged
    } = await authService.changeForgottenPassword({
      sessionID: payload.sub!,
      password: parsed.data.password
    });

    return sendResponse<ChangeForgottenPasswordResponse>({
      res,
      success: true,
      statusCode: 200,
      data: {
        forgottenPasswordChanged
      },
      message: "Password changed successfully.",
      path: req.originalUrl
    });
  }
);