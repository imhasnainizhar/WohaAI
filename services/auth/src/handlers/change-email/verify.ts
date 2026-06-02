import { Request, Response } from "express";
import { asyncHandler } from "@/middlewares/async-handler";
import { sendResponse } from "@packages/http";

import {
  SessionIDSchema
} from "@packages/contracts/auth";

import { ValidationError } from "@packages/errors";
import authService from "@/services/auth-service";
import { VerifyEmailChangeServiceResponse } from "@/services/change-email/verify";

export const verifyEmailChangeHandler = asyncHandler(
  async (req: Request, res: Response) => {

    const sessionID = req.query.sessionID as string
    const parsed = SessionIDSchema.safeParse(sessionID)
    if(!parsed.success) throw new ValidationError("Invalid session ID")

    const { emailUpdated } = 
      await authService.verifyEmailChange({
        sessionID: parsed.data
      });

    return sendResponse<VerifyEmailChangeServiceResponse>({
      res,
      success: true,
      statusCode: 200,
      data: {
        emailUpdated
      },
      message: "Email successfully verified and changed.",
      path: req.originalUrl
    });
  }
);