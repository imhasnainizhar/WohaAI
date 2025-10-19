import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { signInSchema } from "@schemas/signin_validation.schema";
import { prisma } from "@utils/prisma_client";
import { sendResponse } from "@utils/api_response";
import argon2 from "argon2";
import { logger } from "@utils/logger";

type SignInInput = z.infer<typeof signInSchema>;

export const signinService = async (req: Request, res: Response): Promise<void> => {
  // Log incoming request
  logger.info({ contentType: req.headers["content-type"], hasBody: !!req.body }, "🟢 [SIGNIN] Request received");

  try {
    // Validate input using Zod
    const parsed = signInSchema.safeParse(req.body);
    if (!parsed.success) {
      // User input is invalid
      logger.warn({ errors: parsed.error.flatten().fieldErrors }, "🔴 [SIGNIN] Validation failed");
      sendResponse({
        res,
        success: false,
        message: "Invalid input fields.",
        statusCode: 400,
        errors: parsed.error.flatten().fieldErrors,
        errorType: "validation_error",
        path: req.originalUrl,
      });
      return;
    }

    const { email, password, username, rememberMe = false } = parsed.data;

    // Ensure at least email or username is provided
    if (!email && !username) {
      logger.warn({ email, username }, "🔴 [SIGNIN] Missing credentials");
      sendResponse({
        res,
        success: false,
        message: "Either email or username is required.",
        statusCode: 400,
        errorType: "missing_credentials",
        errors: { email: ["Missing email or username"] },
        path: req.originalUrl,
      });
      return;
    }

    if (!password) {
      logger.warn({ username, email }, "🔴 [SIGNIN] Missing password");
      sendResponse({
        res,
        success: false,
        message: "Password is required.",
        statusCode: 400,
        errorType: "missing_password",
        errors: { password: ["Missing password field"] },
        path: req.originalUrl,
      });
      return;
    }

    // Construct Prisma where clause dynamically to find user by email or username
    const where: Record<string, any> = {};
    if (username) where.username = username;
    if (email) where.email = email;

    /**
     * Optimization: Only a single database call is made to fetch the user record.
     * This avoids multiple queries for:
     * 1. Checking if user exists
     * 2. Retrieving hashed password
     * 3. Storing refresh token
     * By fetching the full user object once, we reduce latency and DB load.
     */
    const user = await prisma.user.findFirst({ where });

    if (!user) {
      const missingField = username ? "username" : "email";
      logger.warn({ identifier: email || username }, "🔴 [SIGNIN] No account found with this " + missingField);
      sendResponse({
        res,
        success: false,
        message: `No account found with this ${missingField}.`,
        statusCode: 401,
        errorType: `${missingField}_not_exist`,
        errors: { [missingField]: [`No account exists with this ${missingField}.`] },
        path: req.originalUrl,
      });
      return;
    }

    // Verify password using argon2
    const isPasswordCorrect = await argon2.verify(user.passwordHashed, password);
    if (!isPasswordCorrect) {
      logger.warn({ email, username }, "🔴 [SIGNIN] Incorrect password");
      sendResponse({
        res,
        success: false,
        message: "Incorrect password.",
        statusCode: 401,
        errorType: "wrong_password",
        path: req.originalUrl,
      });
      return;
    }

    const JWT_ACCESS_SECRET_KEY = process.env.JWT_ACCESS_SECRET_KEY;
    const JWT_REFRESH_SECRET_KEY = process.env.JWT_REFRESH_SECRET_KEY;

    if (!JWT_ACCESS_SECRET_KEY || !JWT_REFRESH_SECRET_KEY) {
      logger.error("❌ [SIGNIN] JWT secrets not set in environment");
      sendResponse({
        res,
        success: false,
        statusCode: 500,
        message: "Token unavailable due to server misconfiguration",
        errorType: "token_error",
        path: req.originalUrl,
      });
      return;
    }

    // Define token expirations
    const ACCESS_TOKEN_EXPIRES_IN = "1h";
    const ACCESS_TOKEN_MAX_AGE_MS = 1000 * 60 * 60;
    const sessionDays = rememberMe ? 365 : 7;
    const REFRESH_TOKEN_EXPIRES_IN = rememberMe ? "365d" : "7d";
    const REFRESH_TOKEN_MAX_AGE_MS = 1000 * 60 * 60 * 24 * sessionDays;

    logger.debug("🔑 [SIGNIN] Generating JWTs...");

    // Generate access and refresh tokens
    const accessToken = jwt.sign(
      { sub: user.userID, email: user.email, name: `${user.userFirstName} ${user.userLastName}` },
      JWT_ACCESS_SECRET_KEY,
      { expiresIn: ACCESS_TOKEN_EXPIRES_IN }
    );

    const refreshToken = jwt.sign({ sub: user.userID }, JWT_REFRESH_SECRET_KEY, {
      expiresIn: REFRESH_TOKEN_EXPIRES_IN,
    });

    // Hash the refresh token and store in DB
    const refreshTokenHash = await argon2.hash(refreshToken);
    await prisma.user.update({
      where: { userID: user.userID },
      data: { refreshTokenHash },
    });

    const sameSite = process.env.NODE_ENV === "production" ? "none" : "lax";
    logger.debug("🍪 [SIGNIN] Setting secure cookies...");

    // Set access token and refresh token as HttpOnly cookies
    res.cookie("__woahai_acc_t", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite,
      path: "/",
      maxAge: ACCESS_TOKEN_MAX_AGE_MS,
    });

    res.cookie("__woahai_ref_t", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite,
      path: "/",
      maxAge: REFRESH_TOKEN_MAX_AGE_MS,
    });

    logger.info({ userID: user.userID }, "🟢 [SIGNIN] User authenticated successfully");

    // Send success response
    sendResponse({
      res,
      success: true,
      message: "Login successful.",
      statusCode: 200,
      data: {
        user: {
          id: user.userID,
          firstName: user.userFirstName,
          lastName: user.userLastName,
          email: user.email,
        },
      },
      path: req.originalUrl,
    });
  } catch (err: any) {
    logger.error({ error: err.message }, "❌ [SIGNIN] Unexpected internal error");
    sendResponse({
      res,
      success: false,
      message: "Internal server error.",
      statusCode: 500,
      errorType: "internal_server_error",
      path: req.originalUrl,
    });
  }
};
