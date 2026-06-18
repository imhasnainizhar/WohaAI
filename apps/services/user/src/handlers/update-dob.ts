import { Request, Response } from "express";
import { sendResponse } from "@wohaai/http";
import { userService } from "@/services/user-service";
import { userLogger as logger } from "@wohaai/telemetry";
import { env } from "@wohaai/env-ts";
import { AccessTokenPayload, verifyJwtToken } from "@wohaai/security/jwt";
import { AccessSessionExpiredError, ValidationError } from "@wohaai/errors";
import { UpdateDOBRequestSchema } from '@wohaai/validations';
import { asyncHandler } from '../middlewares/async-handler';
import tokenNames from "../../../../packages/config/token-names.json"

export const updateDOBHandler = asyncHandler(async (req: Request, res: Response) => {
  const accessToken = req.cookies?.[tokenNames.ACCESS_TOKEN];
  const payload = verifyJwtToken({
    token: accessToken,
    secret: env.JWT_AUTH_SECRET_KEY
  }) as AccessTokenPayload;

  // sub is user id, as per standards
  const userID = payload.sub
  if (!userID) throw new AccessSessionExpiredError()

  // Validate input
  const parsed = UpdateDOBRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new ValidationError("Invalid User Update Data", parsed.error)
  }

  const { dateOfBirth } = parsed.data

  // Call service
  await userService.updateDOB({
    userID,
    dateOfBirth
  });

  // Send response
  return sendResponse<void>({
    res,
    success: true,
    statusCode: 200,
    message: "user DOB updated",
    path: req.path,
  });
})