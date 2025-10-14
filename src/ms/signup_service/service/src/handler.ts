import express, { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { signUpSchema } from "@utils/signup_validation_schema";
import { prisma } from "@utils/prisma_client";
import { sendResponse } from "@utils/api_response";
import argon2 from "argon2";

const router = express.Router();

// ⚡ Define the expected structure of the signup request body
interface SignUpRequest {
  FirstName: string;
  LastName: string;
  Username: string;
  Password: string;
  ConfirmPassword: string;
  RememberMe: boolean; // Determines session duration
}

router.post("/", async (req: Request, res: Response): Promise<Response> => {
  console.log("🟢 [SIGNUP] Incoming request:", {
    headers: req.headers["content-type"],
    bodyKeys: Object.keys(req.body || {}),
  });

  try {
    const body: SignUpRequest = req.body;

    // 1️⃣ Validate input using Zod schema
    // 🔍 Ensures correct types, required fields, password rules, etc.
    const parsed = signUpSchema.safeParse(body);
    if (!parsed.success) {
      const flattened = parsed.error.flatten();
      console.warn("⛔ [SIGNUP] Validation failed:", flattened.fieldErrors);

      // 🚫 Send structured validation error response
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

    // ✅ Destructure sanitized data for further use
    const { email, password, firstName, lastName, rememberMe, username } = parsed.data;
    console.log("✅ [SIGNUP] Input validated successfully for:", email);

    // 2️⃣ Check if username/email already exist in DB
    // 🔄 Use OR query to minimize DB calls (efficient!)
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }],
      },
    });

    if (existingUser) {
      const usernameTaken = existingUser.username === username;
      const emailTaken = existingUser.email === email;

      // ⚠️ Handle conflict: both username & email exist
      if (usernameTaken && emailTaken) {
        console.log(`🔴 Username ${username} and email ${email} are already in use`);
        return sendResponse({
          res,
          success: false,
          statusCode: 409,
          message: "Username and Email already taken.",
          errors: {
            username: ["Username already taken"],
            email: ["Email already taken"],
          },
          errorType: "conflict_both",
          path: req.path,
        });
      }

      // ⚠️ Conflict: username only
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

      // ⚠️ Conflict: email only
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

    // 3️⃣ Normalize names
    // ✨ Capitalize first letter, lowercase rest — consistent formatting
    const userFirstName =
      firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase();
    const userLastName =
      lastName.charAt(0).toUpperCase() + lastName.slice(1).toLowerCase();

    // 4️⃣ Hash password securely
    // 🔐 Argon2id is memory-hard, GPU resistant, recommended for passwords
    console.log("🔐 [SIGNUP] Hashing password...");
    const passwordHashed = await argon2.hash(password, {
      type: argon2.argon2id,
      memoryCost: 2 ** 16, // 64 MB RAM per hash
      timeCost: 3,          // Iterations
      parallelism: 1,       // CPU threads
    });

    // 5️⃣ Create user in database
    // 🧩 Insert user record with hashed password & formatted names
    // It uses prisma, for more detail of prisma visit docs: https://www.prisma.io/docs
    console.log("🧩 [SIGNUP] Creating user in database...");
    const newUser = await prisma.user.create({
      data: {
        email,
        passwordHashed,
        username,
        userFirstName,
        userLastName,
      },
    });

    console.log("✅ [SIGNUP] User created with ID:", newUser.userID);

    // 6️⃣ JWT token setup
    // You can set your on secret generate using command given in ./README.md file
    const JWT_SECRET_KEY = process.env.JWT_SECRET;
    if (!JWT_SECRET_KEY) {
      console.error("❌ [SIGNUP] JWT_SECRET not set in environment");
      return sendResponse({
        res,
        success: false,
        statusCode: 500,
        message: "Token unavailable due to server misconfiguration",
        errorType: "token_error",
        path: req.path,
      });
    }

    // 🕒 Determine session duration
    const sessionExpirationTime = rememberMe ? "30d" : "1d"; // JWT expiry
    const cookieMaxAge = rememberMe ? 60 * 60 * 24 * 30 : 60 * 60 * 24; // cookie in seconds

    // 7️⃣ Generate JWT
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

    // 8️⃣ Set cookie securely
    // 🍪 httpOnly + secure + sameSite prevents XSS & CSRF attacks
    console.log("🍪 [SIGNUP] Setting session cookie...");
    res.cookie("woah_session", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: cookieMaxAge * 1000,
    });

    console.log(`🚀 [SIGNUP] User ${username} created successfully with email ${email}.`);

    // 9️⃣ Return success response
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
    // 🔟 Catch unhandled errors
    console.error("❌ [SIGNUP] Error:", {
      message: err.message,
      stack: err.stack?.split("\n")[0],
      name: err.name,
    });

    // 💥 Generic server error response
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
