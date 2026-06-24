import { Request, Response } from "express";
import { sendResponse } from "@wohaai/http";
import { ExpressAdapter } from "@wohaai/http";
import { userService } from "@/services/user-service";
import { env } from "@wohaai/env-ts";
import { AccessTokenPayload, verifyJwtToken } from "@wohaai/security/jwt";
import { AccessSessionExpiredError } from "@wohaai/errors";
import { GetMeServiceResponse } from "@/services/get-me";
import { asyncHandler } from "@/middlewares/async-handler";
import tokenNames from "../../../../../packages/config/token-names.json"
import { GetMeResponse } from "@wohaai/types";

export const getMeHandler = asyncHandler(async (req: Request, res: Response) => {
  const accessToken = req.cookies?.[tokenNames.ACCESS_TOKEN];
  const payload = verifyJwtToken({
    token: accessToken,
    secret: env.JWT_AUTH_SECRET_KEY,
  }) as AccessTokenPayload;

  // sub is user id, as per standards
  const userID = payload.sub
  if (!userID) throw new AccessSessionExpiredError()

  // Call service
  const result = await userService.getMe({ userID });

  // Send response
  return sendResponse<GetMeResponse>({
    res: new ExpressAdapter(res),
    success: true,
    statusCode: 200,
    message: "user created",
    data: {
      ...result
    },
    path: req.path,
  });
})