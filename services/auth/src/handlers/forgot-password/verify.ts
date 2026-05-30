import { Request, Response } from "express";
import { asyncHandler } from "@/middlewares/async-handler";
import {
  buildCookie,
  sendResponse
} from "@packages/http";

import {
  ValidationError
} from "@packages/errors";

import authService from "@/services/auth-service";
import { env } from "@/config/env";
import { exp } from "@/config/exp";

interface VerifyForgotPasswordResponse {

}

export const verifyForgotPasswordSessionHandler = asyncHandler(
  async (req: Request, res: Response) => {

    const sessionID = req.query.sessionId;

    if (
      typeof sessionID !== "string" ||
      sessionID.length === 0
    ) {
      throw new ValidationError(
        "Invalid forgot password session id."
      );
    }

    const {
      forgotPasswordSessionToken,
      redirectTo
    } = await authService.verifyForgetPasswordRequest({
      sessionID
    });

    const forgotPasswordCookie = buildCookie({
      name: env.FORGOT_PASSWORD_SESSION_TOKEN_NAME,
      value: forgotPasswordSessionToken,
      options: {
        httpOnly: true,
        secure: env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: undefined
      }
    });

    return sendResponse<VerifyForgotPasswordResponse>({
      res,
      success: true,
      statusCode: 200,
      data: {
        redirectTo
      },
      message: "Forgot password session verified.",
      path: req.originalUrl,
      cookies: [forgotPasswordCookie]
    });
  }
);