import express, { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { signUpSchema } from "@utils/signup_validation_schema";
import { prisma } from "@utils/prisma_client";
import { sendResponse } from "@utils/api_response";
import argon2 from "argon2";

const router = express.Router();

interface SignUpRequest {
  FirstName: string;
  LastName: string;
  Username: string;
  Password: string;
  ConfirmPassword: string;
  RememberMe: boolean;
}

router.post("/", async (req: Request, res: Response): Promise<Response> => {
  console.log("🟢 [SIGNUP] Incoming request:", {
    headers: req.headers["content-type"],
    bodyKeys: Object.keys(req.body || {}),
  });

  try {
    const body: SignUpRequest = req.body;

    // 1️⃣ Validate input
    const parsed = signUpSchema.safeParse(body);
    if (!parsed.success) {
      const flattened = parsed.error.flatten();
      console.warn("⛔ [SIGNUP] Validation failed:", flattened.fieldErrors);

      return sendResponse({
        res,
        success: false,
        statusCode: 400,
        message: "Unexpected Input",
        errors: flattened.fieldErrors,
        errorType: "validation_error",
        path: req.path,
      });
    }

    const { email, password, firstName, lastName, rememberMe, username } = parsed.data;

    console.log("✅ [SIGNUP] Input validated successfully for:", email);

    // 2️⃣ Check for existing user
    const existingUser = await prisma.user.findFirst({
      where: {
        AND: [{ email }, { username }],
      },
    });

    if (existingUser) {
      if (existingUser.email === email) {
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

      if (existingUser.username === username) {
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
    }

    // 3️⃣ Normalize names
    const userFirstName =
      firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase();
    const userLastName =
      lastName.charAt(0).toUpperCase() + lastName.slice(1).toLowerCase();

    // 4️⃣ Hash password
    console.log("🔐 [SIGNUP] Hashing password...");
    const passwordHashed = await argon2.hash(password, {
      type: argon2.argon2id, // Recommended variant here
      memoryCost: 2 ** 16,   // 64 MB (memory hard)
      timeCost: 3,           // iterations
      parallelism: 1,
    });
    // 5️⃣ Create user
    console.log("🧩 [SIGNUP] Creating user in database...");
    const newUser = await prisma.user.create({
      data: {
        email,
        passwordHashed: passwordHashed,
        username,
        userFirstName,
        userLastName,
      },
    });

    console.log("✅ [SIGNUP] User created with ID:", newUser.userID);

    // 6️⃣ Token setup
    const JWT_SECRET_KEY = process.env.JWT_SECRET;
    if (!JWT_SECRET_KEY) {
      console.error("❌ [SIGNUP] Missing JWT_SECRET in environment");
      return sendResponse({
        res,
        success: false,
        statusCode: 500,
        message: "Token unavailable due to server misconfiguration",
        errorType: "token_error",
        path: req.path,
      });
    }

    const sessionExpirationTime = rememberMe ? "30d" : "1d";
    const cookieMaxAge = rememberMe ? 60 * 60 * 24 * 30 : 60 * 60 * 24;

    // 7️⃣ Sign JWT
    console.log("🔑 [SIGNUP] Generating JWT session token...");
    const sessionToken = jwt.sign(
      {
        sub: newUser.userID,
        email: newUser.email,
        name: `${newUser.userFirstName} ${newUser.userLastName}`,
      },
      JWT_SECRET_KEY,
      { expiresIn: sessionExpirationTime }
    );

    // 8️⃣ Set cookie
    console.log("🍪 [SIGNUP] Setting session cookie...");
    res.cookie("woah_session", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: cookieMaxAge * 1000,
    });

    console.log("🚀 [SIGNUP] User", username, "created successfully.");

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
      message: err.message,
      stack: err.stack?.split("\n")[0],
      name: err.name,
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
});

export default router;
