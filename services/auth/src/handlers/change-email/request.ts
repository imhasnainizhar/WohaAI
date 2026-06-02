import { Request, Response } from "express";
import { asyncHandler } from "@/middlewares/async-handler";
import { sendResponse } from "@packages/http";

import {
  EmailChangeRequest,
  EmailChangeRequestSchema,
  RequestEmailChangeResponse
} from "@packages/contracts/auth";

import { ValidationError } from "@packages/errors";
import authService from "@/services/auth-service";
import { env } from "@/config/env";
import { AccessTokenPayload, verifyJwtToken } from "@packages/jwt";

export const requestEmailChangeHandler = asyncHandler(
  async (req: Request, res: Response) => {
    const accessToken = req.cookies[env.ACCESS_TOKEN_NAME]
    const payload = verifyJwtToken(accessToken) as AccessTokenPayload

    const body: EmailChangeRequest = req.body;
    const userID: string = payload.sub;

    const parsed =
      EmailChangeRequestSchema.safeParse(body);

    if (!parsed.success) {
      throw new ValidationError(
        "Given email could not be validated.",
        parsed.error
      );
    }

    const { verificationEmailSent } = 
      await authService.requestEmailChange({
        userID,
        newEmail: parsed.data.newEmail
      });

    return sendResponse<RequestEmailChangeResponse>({
      res,
      success: true,
      statusCode: 200,
      data: {
        verificationEmailSent
      },
      message: "Email sent to verify email change request.",
      path: req.originalUrl
    });
  }
);