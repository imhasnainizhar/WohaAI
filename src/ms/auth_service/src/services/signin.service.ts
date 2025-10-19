import jwt from "jsonwebtoken";
import { z } from "zod";
import argon2 from "argon2";
import { prisma } from "@utils/prisma_client";
import { signInSchema, SigInUser } from "@schemas/signin_validation.schema";
import { logger } from "@utils/logger";
import { ServiceResponse } from "@utils/service_response";
import { ServiceException } from "@errors/service_exception";

/**
 * Core business logic for user sign-in.
 * Validates input, verifies credentials, generates JWT tokens, and returns cookies.
 */
export const signinService = async <T>(body: SigInUser): Promise<ServiceResponse<T>> => {
  try {
    // Validate the request body using Zod schema
    const parsed = signInSchema.safeParse(body);
    if (!parsed.success) {
      // If validation fails, log the error and throw structured ServiceException
      logger.warn({ message: `🔴 [SIGNIN] Validation failed`, errors: parsed.error.flatten().fieldErrors });
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

    const { email, password, username, rememberMe = false } = parsed.data;

    // Require at least one identifier (email or username)
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

    /**
     * Decide which identifier to use for user lookup:
     * - `prisma.user.findFirst` searches for a user matching either the provided email or username.
     * - The OR clause ensures that if either matches, the user is retrieved.
     * - This allows flexible login using either email or username.
     */
    const user = await prisma.user.findFirst({
      where: { OR: [{ email }, { username }] },
    });

    // If no user is found with given credentials
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

    // Verify the provided password against the hashed password stored in DB
    const isPasswordCorrect = await argon2.verify(user.passwordHashed, password);
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

    // Ensure JWT secret keys are set
    const JWT_ACCESS_SECRET_KEY = process.env.JWT_ACCESS_SECRET_KEY;
    const JWT_REFRESH_SECRET_KEY = process.env.JWT_REFRESH_SECRET_KEY;
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

    // Token expiration and max-age configuration based on rememberMe option
    const ACCESS_TOKEN_EXPIRES_IN = "1h";
    const ACCESS_TOKEN_MAX_AGE_MS = 1000 * 60 * 60;
    const sessionDays = rememberMe ? 365 : 7;
    const REFRESH_TOKEN_EXPIRES_IN = rememberMe ? "365d" : "7d";
    const REFRESH_TOKEN_MAX_AGE_MS = 1000 * 60 * 60 * 24 * sessionDays;

    // Generate JWT access token with user info
    const accessToken = jwt.sign(
      { sub: user.userID, email: user.email, name: `${user.userFirstName} ${user.userLastName}` },
      JWT_ACCESS_SECRET_KEY,
      { expiresIn: ACCESS_TOKEN_EXPIRES_IN }
    );

    // Generate JWT refresh token for long-term session
    const refreshToken = jwt.sign({ sub: user.userID }, JWT_REFRESH_SECRET_KEY, {
      expiresIn: REFRESH_TOKEN_EXPIRES_IN,
    });

    // Hash the refresh token before storing it in DB for security
    const refreshTokenHash = await argon2.hash(refreshToken);
    await prisma.user.update({
      where: { userID: user.userID },
      data: { refreshTokenHash },
    });

    // Configure SameSite cookie attribute depending on environment
    const sameSite = (process.env.NODE_ENV === "production" ? "none" : "lax") as
      "none" | "lax" | "strict";

    // Prepare HTTP-only cookies for access and refresh tokens
    const cookies = [
      {
        name: "__woahai_acc_t",
        value: accessToken,
        options: {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite,
          path: "/",
          maxAge: ACCESS_TOKEN_MAX_AGE_MS,
        },
      },
      {
        name: "__woahai_ref_t",
        value: refreshToken,
        options: {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite,
          path: "/",
          maxAge: REFRESH_TOKEN_MAX_AGE_MS,
        },
      },
    ];

    logger.info(`🟢 [SIGNIN] User ${user.username} authenticated successfully`);

    // Return a structured ServiceResponse for successful sign-in
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

    // If error is already a ServiceException, re-throw it to be handled by controller
    if (err instanceof ServiceException) throw err;

    // Wrap any unexpected error into a structured ServiceException
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
