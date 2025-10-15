import express, { Request, Response } from "express";
import dotenv from "dotenv";
import { sendVerificationEmail } from "@mailer/code_mailer";
import generateVerificationCode from "@hooks/verification_code_generator";
import redisClient from "@utils/redis_client";
import { sendResponse } from "@utils/api_response";

dotenv.config();

const router = express.Router();

router.post("/", async (req: Request, res: Response): Promise<Response> => {
  const { email } = req.body;

  console.log("📨 Incoming request to /verify-email");
  console.log("Request body:", req.body);

  if (!email || typeof email !== "string") {
    console.warn("⚠️ Invalid or missing email field");
    return sendResponse({
      res,
      success: false,
      message: "Invalid email address provided.",
      statusCode: 400,
      errorType: "validation_error",
      errors: { email: ["Email must be a valid string."] },
      path: req.originalUrl,
    });
  }

  try {
    const verificationCode = generateVerificationCode();
    const key = `verify:${email}`;
    const ttl = 300; // 5 minutes

    console.log(`🧠 Generated verification code: ${verificationCode} for ${email}`);

    await redisClient.set(key, verificationCode, "EX", ttl);
    console.log("🗄️ Stored verification code in Redis:", key);

    console.log({
      EMAIL_USER: process.env.EMAIL_USER,
      EMAIL_PASS: process.env.EMAIL_PASS ? "✅ set" : "❌ missing",
    });

    await sendVerificationEmail(email, verificationCode);
    console.log(`📧 Verification email sent successfully to ${email}`);

    return sendResponse({
      res,
      success: true,
      message: "Verification email sent successfully.",
      statusCode: 200,
      data: { email, expiresIn: `${ttl / 60} minutes` },
      path: req.originalUrl,
    });
  } catch (err) {
    console.error("💥 Error sending verification email:", err);

    return sendResponse({
      res,
      success: false,
      message: "Failed to send verification email.",
      statusCode: 500,
      errorType: "server_error",
      errors: { server: ["Internal Server Error"] },
      path: req.originalUrl,
    });
  }
});

export default router;
