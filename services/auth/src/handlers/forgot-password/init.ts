import { Request, Response } from "express";
import { asyncHandler } from "@/middlewares/async-handler";
import { sendResponse } from "@packages/http";

import {
  ForgotPasswordInitRequest,
  ForgotPasswordInitRequestSchema
} from "@packages/contracts/auth";

import { ValidationError } from "@packages/errors";
import authService from "@/services/auth-service";


interface ForgotPasswordInitResponse {
  forgotPasswordEmailSent: boolean;
}

export const forgotPasswordInitHandler = asyncHandler(
  async (req: Request, res: Response) => {

    const body: ForgotPasswordInitRequest = req.body;

    const parsed =
      ForgotPasswordInitRequestSchema.safeParse(body);

    if (!parsed.success) {
      throw new ValidationError(
        "Given credentials could not be validated.",
        parsed.error
      );
    }

    const { forgotPasswordEmailSent } = 
      await authService.forgotPasswordInit({parsed: parsed.data});

    return sendResponse<ForgotPasswordInitResponse>({
      res,
      success: true,
      statusCode: 200,
      data: {
        forgotPasswordEmailSent
      },
      message: "Forgot password email sent.",
      path: req.originalUrl
    });
  }
);