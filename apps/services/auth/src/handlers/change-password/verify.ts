import { Request, Response } from "express";
import { asyncHandler } from "@/middlewares/async-handler";
import {
  buildCookie,
  sendResponse
} from "@wohaai/http";

import {
  ValidationError
} from "@wohaai/errors";

import authService from "@/services/auth-service";
import { SessionIDSchema } from "@wohaai/validations";
import tokenNames from "../../../../../packages/config/token-names.json"
import { env } from "@wohaai/env-ts";

export const verifyChangePasswordHandler = asyncHandler(
  async (req: Request, res: Response) => {

    const sessionID = req.query.sessionID as string

    const parsed = SessionIDSchema.safeParse(sessionID)
    if (!parsed.success) throw new ValidationError("Invalid session id")

    const {
      changePasswordSessionToken
    } = await authService.verifyChangePasswordRequest({
      sessionID: parsed.data
    });

    // This cookie has no age, it is just for a sesison where a user will change their password.
    const changePasswordCookie = buildCookie({
      name: tokenNames.CHANGE_PASSWORD_TOKEN,
      value: changePasswordSessionToken,
      options: {
        httpOnly: true,
        secure: env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: undefined
      }
    });

    return sendResponse({
      res,
      success: true,
      statusCode: 200,
      message: "Change password session verified.",
      path: req.originalUrl,
      cookies: [changePasswordCookie]
    });
  }
);