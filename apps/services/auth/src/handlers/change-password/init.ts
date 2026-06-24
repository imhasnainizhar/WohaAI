import { Request, Response } from "express";
import { asyncHandler } from "@/middlewares/async-handler";
import { sendResponse } from "@wohaai/http";
import { ExpressAdapter } from "@wohaai/http";

import {
  TChangePasswordInitRequest,
  ChangePasswordInitRequestSchema
} from "@wohaai/validations";

import { ValidationError } from "@wohaai/errors";
import authService from "@/services/auth-service";


export const changePasswordInitHandler = asyncHandler(
  async (req: Request, res: Response) => {

    const body: TChangePasswordInitRequest = req.body;

    const parsed =
      ChangePasswordInitRequestSchema.safeParse(body);

    if (!parsed.success) {
      throw new ValidationError(
        "Given credentials could not be validated.",
        parsed.error
      );
    }

    await authService.changePasswordInit({ usernameOrEmail: parsed.data.usernameOrEmail });

    return sendResponse({
      res: new ExpressAdapter(res),
      success: true,
      statusCode: 200,
      message: "Forgot password email sent.",
      path: req.originalUrl
    });
  }
);