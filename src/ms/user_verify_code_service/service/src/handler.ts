import express, { Request, Response, Router } from "express";
import { z } from "zod";
import { VerificationRequestSchema } from "@utils/verification_code_schema";
import redisClient from "@utils/redis_client";
import { sendResponse } from "@utils/api_response";

const router: Router = express.Router();

type VerificationRequest = z.infer<typeof VerificationRequestSchema>;

router.post("/", async (req: Request, res: Response): Promise<void> => {
  try {
    const reqBody = req.body;
    const parsedReq: VerificationRequest = VerificationRequestSchema.parse(reqBody);
    console.log("📨🧩 Parsed request:", parsedReq);

    const { email, verificationCode } = parsedReq;

    const storedCode = await redisClient.get(`verify:${email}`);

    // ⚠️ Expired Code
    if (!storedCode) {
      console.warn("⚠️⌛ Expired or missing verification code");
      return void sendResponse({
        res,
        success: false,
        statusCode: 401,
        message: "Verification code has expired or does not exist.",
        errorType: "expired_code",
        errors: { code: ["The provided verification code is no longer valid."] },
        path: req.originalUrl,
      });
    }

    // ❌ Invalid Code
    if (storedCode !== verificationCode) {
      console.warn("🔴❌ Invalid verification code");
      return void sendResponse({
        res,
        success: false,
        statusCode: 400,
        message: "Invalid verification code provided.",
        errorType: "invalid_code",
        errors: { code: ["The entered code does not match the stored code."] },
        path: req.originalUrl,
      });
    }

    // ✅ Verified
    await redisClient.del(`verify:${email}`);
    console.log("🟢✅ Code verified & deleted");

    return void sendResponse({
      res,
      success: true,
      statusCode: 200,
      message: "Verification successful.",
      data: { verified: true },
      path: req.originalUrl,
    });
  } catch (error) {
    console.error("💥⚠️ Verification error:", error);

    return void sendResponse({
      res,
      success: false,
      statusCode: 400,
      message: "Verification failed due to invalid input or server error.",
      errorType: "verification_failed",
      errors: { general: ["Could not process verification request."] },
      path: req.originalUrl,
    });
  }
});

export default router;
