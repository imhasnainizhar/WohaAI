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
import { SessionIDSchema } from "@packages/contracts/auth";

interface VerifyForgotPasswordResponse {

}

export const verifyForgotPasswordSessionHandler = asyncHandler(
  async (req: Request, res: Response) => {

    const sessionID = req.query.sessionID as string

    const parsed = SessionIDSchema.safeParse(sessionID)
    if(!parsed.success) throw new ValidationError("Invalid session id")

    const {
      forgotPasswordSessionToken,
      redirectTo
    } = await authService.verifyForgetPasswordRequest({
      sessionID: parsed.data
    });

    // This cookie has no age, it is just for a sesison where a user will change their password.
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