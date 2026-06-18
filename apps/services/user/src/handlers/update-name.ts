import { Request, Response } from "express";
import { sendResponse } from "@wohaai/http";
import { userService } from "@/services/user-service";
import { userLogger as logger } from "@wohaai/telemetry";
import { env } from "@wohaai/env-ts";
import { AccessTokenPayload, verifyJwtToken } from "@wohaai/security/jwt";
import { AccessSessionExpiredError, ValidationError } from "@wohaai/errors";
import { UpdateFullNameRequestSchema } from '@wohaai/validations';
import { asyncHandler } from '../middlewares/async-handler';
import tokenNames from "../../../../../packages/config/token-names.json"

export const updateFullNameHandler = asyncHandler(async (req: Request, res: Response) => {
  const accessToken = req.cookies?.[tokenNames.ACCESS_TOKEN];
  const payload = verifyJwtToken({
    token: accessToken,
    secret: env.JWT_AUTH_SECRET_KEY
  }) as AccessTokenPayload;

  // sub is user id, as per standards
  const id = payload.sub
  if (!id) throw new AccessSessionExpiredError()

  // Validate input
  const parsed = UpdateFullNameRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new ValidationError("Invalid User Name Data", parsed.error)
  }

  const { fullName } = parsed.data
  // Call service
  const result = await userService.updateFullName({
    userID: id,
    fullName
  });

  // Send response
  return sendResponse<void>({
    res,
    success: true,
    statusCode: 200,
    message: "user full name updated",
    path: req.path,
  });
})