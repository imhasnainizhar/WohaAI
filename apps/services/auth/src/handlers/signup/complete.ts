import { AuthSessionPayload, verifyJwtToken } from "@wohaai/security/jwt";
import { Request, Response } from "express";
import { asyncHandler } from "@/middlewares/async-handler";
import { buildCookie, Cookie, sendResponse } from "@wohaai/http";
import { env } from "@wohaai/env-ts";
import { authLogger } from "@wohaai/telemetry";
import authService from "@/services/auth-service";
import { SessionExpiredError, ValidationError } from "@wohaai/errors";
import { ClientData } from "@wohaai/types";
import exp from "../../../../../../packages/config/exp.json";
import { getClientData } from "@/ua/client-data";
import tokenNames from "../../../../../../packages/config/token-names.json";

/**
 * Handler for user signup complete.
 */
export const completeSignupHandler = asyncHandler(
  async (req: Request, res: Response) => {
    authLogger.debug({ path: req.originalUrl, method: req.method }, "Signup completion requested");

    const token = req.cookies?.[tokenNames.AUTH_SESSION_TOKEN];

    if (!token) {
      authLogger.debug({ path: req.originalUrl }, "❌ Signup complete failed - no token");
      throw new SessionExpiredError()
    }

    const payload: AuthSessionPayload = verifyJwtToken({
      token,
      secret: env.JWT_AUTH_SECRET_KEY
    });

    if (!payload) {
      authLogger.debug({ path: req.originalUrl }, "❌ Signup complete failed - invalid payload");
      throw new SessionExpiredError()
    }

    const authSessionID = payload.sub;

    // Get client data for creating device signin record in DB
    const clientData: ClientData = getClientData(req);

    const result = await authService.completeSignup({
      authSessionID,
      clientData
    });

    // Build authentication cookies
    const refreshTokenCookie: Cookie = buildCookie({
      name: tokenNames.REFRESH_TOKEN,
      value: result.refreshToken,
      options: {
        httpOnly: true,
        secure: env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: exp.REFRESH_TOKEN_COOKIE
      }
    });

    const accessTokenCookie: Cookie = buildCookie({
      name: tokenNames.ACCESS_TOKEN,
      value: result.accessToken,
      options: {
        httpOnly: true,
        secure: env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: exp.ACCESS_TOKEN_COOKIE
      }
    });

    authLogger.debug({ path: req.originalUrl, method: req.method, userID: result.userID }, "🎉 Signup complete successful");

    // send response
    return sendResponse({
      res,
      success: true,
      statusCode: 200,
      message: "Signup completed successfully",
      data: result,
      path: req.originalUrl,
      cookies: [refreshTokenCookie, accessTokenCookie],
    });
  }
);