import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { signUpSchema } from "@schemas/signup_validation.schema";
import { prisma } from "@utils/prisma_client";
import { sendResponse } from "@utils/api_response";
import argon2 from "argon2";


export async function signupService(req: Request, res: Response): Promise<Response> {
  // Filter out sensitive fields from logs
  const safeBodyKeys = Object.keys(req.body || {}).filter(
    (k) => !["password", "confirmPassword"].includes(k.toLowerCase())
  );

  console.log("🟢 [SIGNUP] Incoming request:", {
    headers: req.headers["content-type"],
    bodyKeys: safeBodyKeys,
  });

  try {
    // Validate input
    const parsed = signUpSchema.safeParse(req.body);
    if (!parsed.success) {
      const flattened = parsed.error.flatten();
      console.warn("⛔ [SIGNUP] Validation failed:", flattened.fieldErrors);
      return sendResponse({
        res,
        success: false,
        statusCode: 400,
        message: "Unexpected input",
        errors: flattened.fieldErrors,
        errorType: "validation_error",
        path: req.path,
      });
    }

    // Destructure - ensure your Zod schema returns these camelCase names
    const { email, password, firstName, lastName, rememberMe = false, username } =
      parsed.data;

    console.log("✅ [SIGNUP] Input validated for:", email);

    // Check duplicates
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }],
      },
    });

    if (existingUser) {
      const usernameTaken = existingUser.username === username;
      const emailTaken = existingUser.email === email;

      if (usernameTaken && emailTaken) {
        console.log(`🔴 Username ${username} and email ${email} are already in use`);
        return sendResponse({
          res,
          success: false,
          statusCode: 409,
          message: "Username and Email already taken.",
          errors: { username: ["Username already taken"], email: ["Email already taken"] },
          errorType: "conflict_both",
          path: req.path,
        });
      }
      if (usernameTaken) {
        console.log(`🔴 Username ${username} already taken`);
        return sendResponse({
          res,
          success: false,
          statusCode: 409,
          message: "Username not available.",
          errors: { username: ["Username already taken"] },
          errorType: "username_unavailable",
          path: req.path,
        });
      }
      if (emailTaken) {
        console.log(`🔴 Email ${email} already taken`);
        return sendResponse({
          res,
          success: false,
          statusCode: 409,
          message: "Email already taken.",
          errors: { email: ["Email already taken"] },
          errorType: "email_unavailable",
          path: req.path,
        });
      }
    }

    // Normalize names
    const userFirstName =
      firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase();
    const userLastName =
      lastName.charAt(0).toUpperCase() + lastName.slice(1).toLowerCase();

    // Hash password
    console.log("🔐 [SIGNUP] Hashing password...");
    const passwordHashed = await argon2.hash(password, {
      type: argon2.argon2id,
      memoryCost: 2 ** 16,
      timeCost: 3,
      parallelism: 1,
    });

    // Secrets
    const JWT_ACCESS_SECRET_KEY = process.env.JWT_ACCESS_SECRET_KEY;
    const JWT_REFRESH_SECRET_KEY = process.env.JWT_REFRESH_SECRET_KEY;

    if (!JWT_ACCESS_SECRET_KEY || !JWT_REFRESH_SECRET_KEY) {
      console.error("❌ [SIGNUP] JWT secrets not set in environment");
      return sendResponse({
        res,
        success: false,
        statusCode: 500,
        message: "Token unavailable due to server misconfiguration",
        errorType: "token_error",
        path: req.path,
      });
    }

    // Expirations (ms for cookies)
    const ACCESS_TOKEN_EXPIRES_IN = "1h"; // keep short: 15m-1h
    const ACCESS_TOKEN_MAX_AGE_MS = 1000 * 60 * 60; // 1 hour
    const sessionDays = rememberMe ? 365 : 7;
    const REFRESH_TOKEN_EXPIRES_IN = rememberMe ? "365d" : "7d";
    const REFRESH_TOKEN_MAX_AGE_MS = 1000 * 60 * 60 * 24 * sessionDays; // match refresh JWT

    // Generate tokens — ACCESS first, then REFRESH
    console.log("🔑 [SIGNUP] Generating JWTs...");

    const tempID = crypto.randomUUID();

    const accessToken = jwt.sign(
      {
        sub: tempID,   // Just for temporary signing jwt further it will be replaced by newUser.userID after user creation in DB
        email: email,
        name: `${userFirstName} ${userLastName}`,
      },
      JWT_ACCESS_SECRET_KEY,
      { expiresIn: ACCESS_TOKEN_EXPIRES_IN }
    );

    const refreshToken = jwt.sign(
      {
        sub: tempID,
      },
      JWT_REFRESH_SECRET_KEY,
      { expiresIn: REFRESH_TOKEN_EXPIRES_IN }
    );

    // Store hashed refresh token for future rotation/revocation.
    // NOTE: the `refreshTokenHash` field is added to Prisma user model.
    const refreshTokenHash = await argon2.hash(refreshToken);

    // Creating User after signining token and hashing refresh token
    console.log("🧩 [SIGNUP] Creating user in database...");
    const newUser = await prisma.user.create({
      data: {
        email,
        passwordHashed,
        username,
        userFirstName,
        userLastName,
        refreshTokenHash : refreshTokenHash
      },
    });

    console.log("✅ [SIGNUP] User created with ID", newUser.userID, "in DB");

      const finalAccessToken = jwt.sign(
      {
        sub: newUser.userID,
        email: email,
        name: `${userFirstName} ${userLastName}`,
      },
      JWT_ACCESS_SECRET_KEY,
      { expiresIn: ACCESS_TOKEN_EXPIRES_IN }
    );

    const finalRefreshToken = jwt.sign(
      {
        sub: newUser.userID,
      },
      JWT_REFRESH_SECRET_KEY,
      { expiresIn: REFRESH_TOKEN_EXPIRES_IN }
    );

    // Cookies
    const sameSite = process.env.NODE_ENV === "production" ? "none" : "lax";
    console.log("🍪 [SIGNUP] Setting session cookies...");

    // Set Access cookie (short-lived)
    res.cookie("__woahai_acc_t", finalAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite,
      path: "/",
      maxAge: ACCESS_TOKEN_MAX_AGE_MS,
    });

    // Set Refresh cookie (long-lived)
    res.cookie("__woahai_ref_t", finalRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite,
      path: "/",
      maxAge: REFRESH_TOKEN_MAX_AGE_MS,
    });

    console.log(`🚀 [SIGNUP] User ${username} created successfully with email ${email}.`);

    // Return success
    return sendResponse({
      res,
      success: true,
      statusCode: 201,
      message: "User created successfully",
      data: {
        email: newUser.email,
        username: newUser.username,
        userID: newUser.userID,
      },
      path: req.path,
    });
  } catch (err: any) {
    console.error("❌ [SIGNUP] Error:", {
      message: err?.message,
      stack: err?.stack?.split("\n")[0],
      name: err?.name,
    });

    return sendResponse({
      res,
      success: false,
      statusCode: 500,
      message: "Something went wrong on our side",
      errorType: "internal_server_error",
      path: req.path,
    });
  }
}