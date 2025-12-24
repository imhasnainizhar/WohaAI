import jwt, { SignOptions } from "jsonwebtoken";
import argon2 from "argon2";
import { prisma } from "@utils/prisma_client";
import { signInSchema, SigInUser } from "@schemas/signin_validation";
import { logger } from "@utils/logger";
import { ServiceResponse, ServiceException } from "@utils/response";
import { env, EXPIRATION } from "@config/env";
import { createUserSession } from "@utils/create_user_session";
import { ClientData } from "../internals/types/session";

/**
 * Core business logic for user sign-in.
 * Validates input, verifies credentials, generates JWT tokens, and returns cookies.
 */
export const signinService = async <T>(
  body: SigInUser,
  clientData: ClientData
): Promise<ServiceResponse<T>> => {
  try {

    // Validate the request body using Zod schema
    const parsed = signInSchema.safeParse(body);
    if (!parsed.success) {
      // If validation fails, log the error and throw structured ServiceException
      throw new ServiceException(
        ServiceResponse.error({
          success: false,
          statusCode: 400,
          message: "Invalid input fields.",
          errorType: "validation_error",
          errors: parsed.error.flatten().fieldErrors,
        })
      );
    }
    const { username, password, email, rememberMe = false } = body;

    if (!email && !username) {
      throw new ServiceException(
        ServiceResponse.error({
          success: false,
          statusCode: 400,
          message: "Either email or username is required.",
          errorType: "missing_credentials",
          errors: { credentials: ["Email or username must be provided"] },
        })
      );
    }

    // ✅ Fetch full user record for authentication
    const user = await prisma.user.findFirst({
      where: { OR: [{ email }, { username }] },
      select: {
        userID: true,
        userFirstName: true,
        userLastName: true,
        email: true,
        username: true,
        hashedPassword: true,
      },
    });

    if (!user) {
      throw new ServiceException(
        ServiceResponse.error({
          success: false,
          statusCode: 401,
          message: "No account found with provided credentials.",
          errorType: "user_not_found",
        })
      );
    }

    // ✅ Verify password
    const isPasswordCorrect = await argon2.verify(user.hashedPassword, password);
    if (!isPasswordCorrect) {
      throw new ServiceException(
        ServiceResponse.error({
          success: false,
          statusCode: 401,
          message: "Incorrect password.",
          errorType: "wrong_password",
        })
      );
    }

    // ✅ Ensure JWT keys are available
    const { JWT_ACCESS_SECRET_KEY, JWT_REFRESH_SECRET_KEY } = env;
    if (!JWT_ACCESS_SECRET_KEY || !JWT_REFRESH_SECRET_KEY) {
      throw new ServiceException(
        ServiceResponse.error({
          success: false,
          statusCode: 500,
          message: "Server misconfiguration: JWT keys missing.",
          errorType: "token_error",
        })
      );
    }

    // 🧩 Step 1: Generate refresh token
    const refreshToken = jwt.sign(
      { sub: user.userID },
      JWT_REFRESH_SECRET_KEY,
      rememberMe
        ? ({ expiresIn: EXPIRATION.JWT_REFRESH_SESSION_TOKEN } as SignOptions)
        : ({ expiresIn: EXPIRATION.JWT_REFRESH_REMEMBER_OFF_SESSION_TOKEN } as SignOptions)
    );

    // 🧩 Step 2: Create a session record in DB (hash refresh token, store device/IP info)
    const session = await createUserSession(user.userID, clientData, refreshToken, rememberMe);

    const finalRefreshToken = jwt.sign(
      { sub: user.userID, userSessionID: session.userSessionID },
      JWT_REFRESH_SECRET_KEY,
      rememberMe
        ? ({ expiresIn: EXPIRATION.JWT_REFRESH_SESSION_TOKEN } as SignOptions)
        : ({ expiresIn: EXPIRATION.JWT_REFRESH_REMEMBER_OFF_SESSION_TOKEN } as SignOptions)
    );

    // 🧩 Step 3: Generate access token tied to this session
    const accessToken = jwt.sign(
      {
        sub: user.userID,
        email: user.email,
        name: `${user.userFirstName} ${user.userLastName}`,
        userSessionID: session.userSessionID,
      },
      JWT_ACCESS_SECRET_KEY,
      { expiresIn: EXPIRATION.JWT_ACCESS_SESSION_TOKEN } as SignOptions
    );

    // 🧩 Step 4: Prepare cookies
    const sameSite = env.SAME_SITE_COOKIE_OPTION;
    const secureSite = env.SECURE_COOKIE_OPTION;

    const cookies = [
      {
        name: env.ACCESS_TOKEN_NAME,
        value: accessToken,
        options: {
          httpOnly: true,
          secure: secureSite,
          sameSite,
          path: "/",
          maxAge: EXPIRATION.ACCESS_SESSION_COOKIE,
        },
      },
      {
        name: env.REFRESH_TOKEN_NAME,
        value: finalRefreshToken,
        options: rememberMe ?
          {
            httpOnly: true,
            secure: secureSite,
            sameSite,
            path: "/",
            maxAge: EXPIRATION.REFRESH_SESSION_COOKIE
          } : {
            httpOnly: true,
            secure: secureSite,
            sameSite,
            path: "/",
          }
      },
    ];

    logger.info({
      message: "🟢 [SIGNIN] User authenticated successfully",
      userID: user.userID,
      username: user.username,
      ip: session.userIPAddress,
      device: session.userDeviceName,
    });

    // ✅ Step 5: Return unified service response
    return ServiceResponse.success({
      success: true,
      statusCode: 200,
      message: "Login successful.",
      data: {
        user: {
          id: user.userID,
          firstName: user.userFirstName,
          lastName: user.userLastName,
          email: user.email,
        },
      } as T,
      cookies,
    });
  } catch (err: any) {
    logger.error("❌ [SIGNIN] Unexpected error", err);

    if (err instanceof ServiceException) throw err;

    throw new ServiceException(
      ServiceResponse.error({
        success: false,
        statusCode: 500,
        message: err?.message || "Internal server error",
        errorType: "internal_server_error",
        errors: err?.errors,
      })
    );
  }
};
