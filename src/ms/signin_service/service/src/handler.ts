import express, { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { signInSchema } from "@utils/signin_validation_schema";
import { prisma } from "@utils/prisma_client";
import { sendResponse } from "@utils/api_response";
import argon2 from "argon2";

const router = express.Router();

type SignInInput = z.infer<typeof signInSchema>;

router.post("/", async (req: Request, res: Response): Promise<void> => {
  console.log("🟢 [SIGNIN] Request received:", {
    contentType: req.headers["content-type"],
    hasBody: !!req.body,
  });

  try {
    // ✅ 1. Validate input properly
    const parsed = signInSchema.safeParse(req.body);
    console.log(parsed)
    console.log(req.body)
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
    console.log("🟢 [SIGNIN] Input validated for:", email);

    if (!email && !username) {
      sendResponse({
        res,
        success: false,
        message: "Either Use Email or Username.",
        statusCode: 401,
        errors: { password: ["Missing Email or Username"] },
        errorType: "missing_credentials",
        path: req.originalUrl,
      })
      return;
    }

    if (!password) {
      sendResponse({
        res,
        success: false,
        message: "Provide Password to Signin.",
        statusCode: 401,
        errors: { password: ["Missing Password Field"] },
        errorType: "missing_credentials",
        path: req.originalUrl,
      })
      return;
    }

    // 2️⃣ Find user
    const where: any = {};
    if (username) where.username = username;
    if (email) where.email = email;

    const user = await prisma.user.findFirst({ where });
    if (!user) {
      const missingField = username ? "username" : "email";

      console.warn(`❌ [SIGNIN] No account found with this ${missingField}:`, email || username);

      sendResponse({
        res,
        success: false,
        message: `No acc ount found with this ${missingField}.`,
        statusCode: 401,
        errorType: `${missingField}_not_exist`,
        errors: {
          [missingField]: [`No account exists with this ${missingField}.`],
        },
        path: req.originalUrl,
      });
      return;
    }

    // 3️⃣ Verify password
    const isPasswordCorrect = await argon2.verify(user.passwordHashed, password);
    
    if (!isPasswordCorrect) {
      console.warn(" [SIGNIN] In correct password for:", email);
      sendResponse({
        res,
        success : false,
        message: "Incorrect password.",
        statusCode: 401,
        errorType: "wrong_password",
        path: req.originalUrl,
      });
      return;
    }

    // 4️⃣ Generate token
    const JWT_SECRET = process.env.JWT_SECRET;
    if (!JWT_SECRET) {
      console.error("❌ [SIGNIN] Missing JWT_SECRET in environment.");
      throw new Error("Token generation unavailable");
    }

    const sessionExpirationTime = "1d";
    const cookieMaxAge = rememberMe ? 60 * 60 * 24 * 30 : 60 * 60 * 24;

    const sessionToken = jwt.sign(
      {
        sub: user.userID,
        email: user.email,
        name: `${user.userFirstName} ${user.userLastName}`,
      },
      JWT_SECRET,
      rememberMe ? {} : { expiresIn: sessionExpirationTime }
    );

    // 5️⃣ Set secure cookie
    res.cookie("woah_session", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: cookieMaxAge * 1000,
    });

    console.log(`🟢 [SIGNIN] User '${email}' successfully authenticated.`);

    sendResponse({
      res,
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
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("🔴 [SIGNIN] Unexpected Error:", message);

    sendResponse({
      res,
      success: false,
      message: "Internal server error.",
      statusCode: 500,
      errorType: "internal_server_error",
      errors: { system: [message] },
      path: req.originalUrl,
    });
  }
});

export default router;
