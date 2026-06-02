import { Request, Response } from "express";
import { sendResponse } from "@packages/http";
import { userService } from "@/services/user-service";
import { env } from "@/config/env";
import { AccessTokenPayload, verifyJwtToken } from "@packages/jwt";
import { AccessSessionExpiredError } from "@packages/errors";
import { GetMeServiceResponse } from "@/services/get-me";
import { asyncHandler } from "@/middlewares/async-handler";

export const getMeHandler = asyncHandler(async (req: Request, res: Response) => {
  const accessToken = req.cookies?.[env.ACCESS_TOKEN_NAME];
  const payload = verifyJwtToken({
    token: accessToken,
    secret: env.ACCESS_TOKEN_NAME
  }) as AccessTokenPayload;

  // sub is user id, as per standards
  const userID = payload.sub
  if (!userID) throw new AccessSessionExpiredError()

  // Call service
  const result = await userService.getMe({userID});

  // Send response
  return sendResponse<GetMeServiceResponse>({
    res,
    success: true,
    statusCode: 200,
    message: "user created",
    data: {
      ...result
    },
    path: req.path,
  });
})