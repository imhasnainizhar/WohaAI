import { Request, Response } from "express";
import { sendResponse } from "@packages/http";
import { userService } from "@/services/user-service";
import { userLogger as logger } from "@packages/observability";
import { env } from "@/config/env";
import { AccessTokenPayload, verifyJwtToken } from "@packages/jwt";
import { AccessSessionExpiredError, ValidationError } from "@packages/errors";
import { CreateUserSchema, UpdateUserSchema } from '@packages/contracts/user';
import { asyncHandler } from '../middlewares/async-handler';

export const updateUserHandler = asyncHandler(async (req: Request, res: Response) => {
  const accessToken = req.cookies?.[env.ACCESS_TOKEN_NAME];
  const payload = verifyJwtToken({
    token: accessToken,
    secret: env.ACCESS_TOKEN_NAME
  }) as AccessTokenPayload;

  // sub is user id, as per standards
  const id = payload.sub
  if (!id) throw new AccessSessionExpiredError()

  // Validate input
  const parsed = UpdateUserSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new ValidationError("Invalid User Update Data", parsed.error)
  }

  const { username, firstName, lastName, dateOfBirth } = parsed.data
  // Call service
  const result = await userService.updateUser({
    id,
    username,
    firstName,
    lastName,
    dateOfBirth
  });

  // Send response
  return sendResponse<{ userUpdated: boolean }>({
    res,
    success: true,
    statusCode: 200,
    message: "user created",
    data: {
      userUpdated: result.userUpdated
    },
    path: req.path,
  });
})