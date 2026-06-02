import { SignupSessionPayload, verifyJwtToken } from "@packages/jwt";
import { Request, Response } from "express";
import { asyncHandler } from "@/middlewares/async-handler";
import { buildCookie, Cookie, sendResponse } from "@packages/http";
import { env } from "@/config/env";
import authService from "@/services/auth-service";
import { SessionExpiredError, ValidationError } from "@packages/errors";
import { ClientData, SignupCompleteRequest, SignupCompleteRequestSchema } from "@packages/contracts/auth";
import { exp } from "@/config/exp";
import { getClientData } from "@/ua/client-data";

/**
 * Handler for user signup complete.
 */
export const completeSignupHandler = asyncHandler(
  async (req: Request, res: Response) => {

    const token = req.cookies?.[env.SIGNUP_SESSION_TOKEN_NAME];

    if (!token) throw new SessionExpiredError()

    const payload: SignupSessionPayload = verifyJwtToken({
      token,
      secret: env.JWT_SIGNUP_SESSION_SECRET_KEY
    });

    if (!payload) throw new SessionExpiredError()

    const body: SignupCompleteRequest = req.body

    const parsed =
      SignupCompleteRequestSchema.safeParse(body)

    if (!parsed.success) throw new ValidationError("Invalid remember me option", parsed.error)
    const { rememberMe } = parsed.data

    const signupSessionID = payload.signupSessionID;

    // Get client data for creating device signin record in DB
    const clientData: ClientData = getClientData(req);

    const result = await authService.completeSignup({
      signupSessionID,
      rememberMe,
      clientData
    });

    // Build authentication cookies
    const refreshTokenCookie: Cookie = buildCookie({
      name: env.REFRESH_TOKEN_NAME,
      value: result.refreshToken,
      options: {
        httpOnly: true,
        secure: env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: parsed.data.rememberMe ? exp.REFRESH_TOKEN_COOKIE : undefined
      }
    });

    const accessTokenCookie: Cookie = buildCookie({
      name: env.ACCESS_TOKEN_NAME,
      value: result.accessToken,
      options: {
        httpOnly: true,
        secure: env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: parsed.data.rememberMe ? exp.ACCESS_TOKEN_COOKIE : undefined
      }
    });

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