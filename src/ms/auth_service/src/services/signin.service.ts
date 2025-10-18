import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { signInSchema } from "@schemas/signin_validation.schema";
import { prisma } from "@utils/prisma_client";
import { sendResponse } from "@utils/api_response";
import argon2 from "argon2";

type SignInInput = z.infer<typeof signInSchema>;

export const signinService = async (req: Request, res: Response): Promise<void> => {
  console.log("🟢 [SIGNIN] Request received:", {
    contentType: req.headers["content-type"],
    hasBody: !!req.body,
  });

  try {
    // ✅ 1. Validate input
    const parsed = signInSchema.safeParse(req.body);
    if (!parsed.success) {
      console.warn("⛔ [SIGNIN] Validation failed.");
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

    if (!email && !username) {
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

    // 2️⃣ Find user
    const where: Record<string, any> = {};
    if (username) where.username = username;
    if (email) where.email = email;

    const user = await prisma.user.findFirst({ where });
    if (!user) {
      const missingField = username ? "username" : "email";
      console.warn(`❌ [SIGNIN] No account found with this ${missingField}:`, email || username);
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

    // 3️⃣ Verify password
    const isPasswordCorrect = await argon2.verify(user.passwordHashed, password);
    if (!isPasswordCorrect) {
      console.warn("❌ [SIGNIN] Incorrect password for:", email || username);
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

    // 4️⃣ Secrets
    const JWT_ACCESS_SECRET_KEY = process.env.JWT_ACCESS_SECRET_KEY;
    const JWT_REFRESH_SECRET_KEY = process.env.JWT_REFRESH_SECRET_KEY;

    if (!JWT_ACCESS_SECRET_KEY || !JWT_REFRESH_SECRET_KEY) {
      console.error("❌ [SIGNIN] JWT secrets not set in environment");
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

    // 5️⃣ Expirations (ms for cookies)
    const ACCESS_TOKEN_EXPIRES_IN = "1h";
    const ACCESS_TOKEN_MAX_AGE_MS = 1000 * 60 * 60; // 1 hour
    const sessionDays = rememberMe ? 365 : 7;
    const REFRESH_TOKEN_EXPIRES_IN = rememberMe ? "365d" : "7d";
    const REFRESH_TOKEN_MAX_AGE_MS = 1000 * 60 * 60 * 24 * sessionDays;

    // 6️⃣ Generate tokens
    console.log("🔑 [SIGNIN] Generating JWTs...");

    const accessToken = jwt.sign(
      {
        sub: user.userID,
        email: user.email,
        name: `${user.userFirstName} ${user.userLastName}`,
      },
      JWT_ACCESS_SECRET_KEY,
      { expiresIn: ACCESS_TOKEN_EXPIRES_IN }
    );

    const refreshToken = jwt.sign(
      { sub: user.userID },
      JWT_REFRESH_SECRET_KEY,
      { expiresIn: REFRESH_TOKEN_EXPIRES_IN }
    );

    // 7️⃣ Store hashed refresh token
    const refreshTokenHash = await argon2.hash(refreshToken);
    await prisma.user.update({
      where: { userID: user.userID },
      data: { refreshTokenHash },
    });

    // 8️⃣ Set Cookies
    const sameSite = process.env.NODE_ENV === "production" ? "none" : "lax";
    console.log("🍪 [SIGNIN] Setting secure cookies...");

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

    console.log(`🟢 [SIGNIN] User '${email || username}' authenticated successfully.`);

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
  } catch (err) {
    console.error("🔴 [SIGNIN] Unexpected Error:", err);
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
