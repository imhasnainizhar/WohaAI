import jwt, { SignOptions } from "jsonwebtoken";
import argon2 from "argon2";
import { prisma } from "@clients/prisma";
import { logger } from "@packages/shared/utils";
import { ServiceResponse, ServiceException } from "@packages/shared/utils";
import { env, EXPIRATION } from "@config/env";
import { createUserSession } from "@helpers/create-user-session";
import { SigninDTO } from "@packages/shared/auth";


/**
 * Core business logic for user sign-in.
 * Validates input, verifies credentials, generates JWT tokens, and returns cookies.
 */
export const signinService = async <T>(
  { usernameOrEmail,
    password,
    clientData
  }: SigninDTO): Promise<ServiceResponse<T>> => {
  try {
    if (!usernameOrEmail.value) {
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

    // Fetch full user record for authentication
    const user = await prisma.user.findFirst({
      where: { OR: [{ username: usernameOrEmail.value }, { email: usernameOrEmail.value }] },
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

    // Verify password
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

    // Ensure JWT keys are available
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

    // Generate session ID
    const userSessionID = crypto.randomUUID();

    // Generate refresh token with session ID
    const refreshToken = jwt.sign(
      { sub: user.userID, userSessionID },
      JWT_REFRESH_SECRET_KEY,
      { expiresIn: EXPIRATION.JWT_REFRESH_SESSION_TOKEN } as SignOptions
    );

    // Create a session record in DB (hash refresh token, store device/IP info)
    const session = await createUserSession({
      userID: user.userID,
      clientData,
      refreshToken,
      userSessionID,
    });

    const finalRefreshToken = jwt.sign(
      { sub: user.userID, userSessionID: session.userSessionID },
      JWT_REFRESH_SECRET_KEY,
      { expiresIn: EXPIRATION.JWT_REFRESH_SESSION_TOKEN } as SignOptions
    );

    // Generate access token tied to this session
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

    // Prepare cookies
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
        options:
        {
          httpOnly: true,
          secure: secureSite,
          sameSite,
          path: "/",
          maxAge: EXPIRATION.REFRESH_SESSION_COOKIE
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

    // Return unified service response
    return ServiceResponse.success({
      success: true,
      statusCode: 200,
      message: "Login successful.",
      data: {
        user: {
          userID: user.userID,
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
