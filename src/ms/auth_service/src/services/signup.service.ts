import jwt from "jsonwebtoken";
import { signUpSchema, SignUpUser } from "@schemas/signup_validation.schema";
import { prisma } from "@utils/prisma_client";
import argon2 from "argon2";
import { ServiceResponse } from "@utils/service_response";
import { ServiceException } from "@errors/service_exception";
import { logger } from "@utils/logger";
import crypto from "crypto";
import { env } from "@config/env.config";

/**
 * Handles user signup — validation, password hashing, duplicate checks,
 * token generation, and cookie configuration.
 * 
 * Returns a typed `ServiceResponse` or throws structured errors.
 */
export async function signupService<T>(body: SignUpUser): Promise<ServiceResponse<T>> {
  try {
    // Validate request body using Zod
    const parsed = signUpSchema.safeParse(body);
    if (!parsed.success) {
      const flattened = parsed.error.flatten();
      logger.warn({
        message: "⛔ [SIGNUP] Validation failed",
        errors: flattened.fieldErrors,
      });

        return ServiceResponse.error({
          success: false,
          statusCode: 400,
          message: "Invalid input fields.",
          errorType: "validation_error",
          errors: flattened.fieldErrors,
        })
    }

    const { email, password, firstName, lastName, rememberMe = false, username } = parsed.data;

    logger.info(`✅ [SIGNUP] Input validated for email: ${email}`);

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: { OR: [{ email }, { username }] },
    });

    if (existingUser) {
      const usernameTaken = existingUser.username === username;
      const emailTaken = existingUser.email === email;

      if (usernameTaken && emailTaken) {
        logger.error(`🔴 [SIGNUP] Username ${username} and email ${email} already taken`);
          return ServiceResponse.error({
            success: false,
            statusCode: 409,
            message: "Username and Email already taken.",
            errors: {
              username: ["Username taken"],
              email: ["Email taken"],
            },
            errorType: "conflict_both",
          })
      }

      if (usernameTaken) {
        logger.error(`🔴 [SIGNUP] Username ${username} is unavailable`);
          return ServiceResponse.error({
            success: false,
            statusCode: 409,
            message: "Username not available.",
            errors: { username: ["Username taken"] },
            errorType: "username_unavailable",
          })
      }

      if (emailTaken) {
        logger.error(`🔴 [SIGNUP] Email ${email} already exists`);
          return ServiceResponse.error({
            success: false,
            statusCode: 409,
            message: "Email already taken.",
            errors: { email: ["Email taken"] },
            errorType: "email_unavailable",
          })
      }
    }

    // Normalize capitalization
    const userFirstName =
      firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase();
    const userLastName =
      lastName.charAt(0).toUpperCase() + lastName.slice(1).toLowerCase();

    logger.info("🔐 [SIGNUP] Hashing user password...");
    const passwordHashed = await argon2.hash(password, {
      type: argon2.argon2id,
      memoryCost: 2 ** 16,
      timeCost: 3,
      parallelism: 1,
    });

    // Verify JWT keys
    const JWT_ACCESS_SECRET_KEY = env.JWT_ACCESS_SECRET_KEY;
    const JWT_REFRESH_SECRET_KEY = env.JWT_REFRESH_SECRET_KEY;

    if (!JWT_ACCESS_SECRET_KEY || !JWT_REFRESH_SECRET_KEY) {
      logger.error("❌ [SIGNUP] Missing JWT secret environment variables");
      throw new ServiceException(
        ServiceResponse.error({
          success: false,
          message: "Server misconfiguration: JWT keys missing",
          statusCode: 500,
          errorType: "token_error",
          errors: { env: ["JWT secrets not set"] },
        })
      );
    }

    // Token + session configuration
    const ACCESS_TOKEN_EXPIRES_IN = "1h";
    const ACCESS_TOKEN_MAX_AGE_MS = 1000 * 60 * 60;
    const sessionDays = rememberMe ? 365 : 7;
    const REFRESH_TOKEN_EXPIRES_IN = rememberMe ? "365d" : "7d";
    const REFRESH_TOKEN_MAX_AGE_MS = 1000 * 60 * 60 * 24 * sessionDays;

    const tempID = crypto.randomUUID();

    const refreshToken = jwt.sign({ sub: tempID }, JWT_REFRESH_SECRET_KEY, {
      expiresIn: REFRESH_TOKEN_EXPIRES_IN,
    });
    const refreshTokenHash = await argon2.hash(refreshToken);

    logger.info("🧩 [SIGNUP] Creating new user in DB...");
    const newUser = await prisma.user.create({
      data: {
        email,
        passwordHashed,
        username,
        userFirstName,
        userLastName,
        refreshTokenHash,
      },
    });

    logger.info(`✅ [SIGNUP] User created successfully (ID: ${newUser.userID})`);

    // Generate tokens
    const accessToken = jwt.sign(
      { sub: newUser.userID, email, name: `${userFirstName} ${userLastName}` },
      JWT_ACCESS_SECRET_KEY,
      { expiresIn: ACCESS_TOKEN_EXPIRES_IN }
    );

    const finalRefreshToken = jwt.sign(
      { sub: newUser.userID },
      JWT_REFRESH_SECRET_KEY,
      { expiresIn: REFRESH_TOKEN_EXPIRES_IN }
    );

    // Configure cookies
    const sameSite = (env.NODE_ENV === "production" ? "none" : "lax") as
      "none" | "lax" | "strict";

    const cookies = [
      {
        name: "__woahai_acc_t",
        value: accessToken,
        options: {
          httpOnly: true,
          secure: env.NODE_ENV === "production",
          sameSite,
          path: "/",
          maxAge: ACCESS_TOKEN_MAX_AGE_MS,
        },
      },
      {
        name: "__woahai_ref_t",
        value: finalRefreshToken,
        options: {
          httpOnly: true,
          secure: env.NODE_ENV === "production",
          sameSite,
          path: "/",
          maxAge: REFRESH_TOKEN_MAX_AGE_MS,
        },
      },
    ];

    logger.info(`🚀 [SIGNUP] User ${username} successfully registered`);

    return ServiceResponse.success({
      success: true,
      statusCode: 201,
      message: "User created successfully",
      data: {
        email: newUser.email,
        username: newUser.username,
        userID: newUser.userID,
      } as T,     // Because 
      cookies,
    });
  } catch (err: any) {
    // ⚠️ Handle structured or unexpected errors
    if (err instanceof ServiceException) throw err; // pass up structured errors

    logger.error({
      message: `❌ [SIGNUP] Unexpected error`,
      error: err.message,
      stack: err.stack?.split("\n")[0],
    });

    throw new ServiceException(
      ServiceResponse.error({
        success: false,
        message: err?.message || "Internal server error",
        statusCode: 500,
        errorType: "internal_server_error",
        errors: err?.errors,
      })
    );
  }
}
