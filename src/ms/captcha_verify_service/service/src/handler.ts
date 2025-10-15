import express, { Request, Response, Router } from "express";
import { sendResponse } from "@utils/api_response";

const router: Router = express.Router();

interface CaptchaRequestBody {
  captchaToken: string;
}

interface CaptchaVerifyResponse {
  success: boolean;
  challenge_ts?: string;
  hostname?: string;
  score?: number;
  action?: string;
  "error-codes"?: string[];
}

router.post("/", async (req: Request<{}, {}, CaptchaRequestBody>, res: Response): Promise<void> => {
  const { captchaToken } = req.body;
  const RECAPTCHA_SECRET_KEY = process.env.RECAPTCHA_SECRET_KEY;

  if (!RECAPTCHA_SECRET_KEY || !captchaToken) {
    console.warn("⚠️ Missing RECAPTCHA_SECRET_KEY or captchaToken in request.");

    return void sendResponse({
      res,
      success: false,
      statusCode: 400,
      message: "Missing reCAPTCHA token or server key.",
      errorType: "missing_data",
      errors: { captcha: ["captchaToken or RECAPTCHA_SECRET_KEY missing."] },
      path: req.originalUrl,
    });
  }

  try {
    const verifyURL = "https://www.google.com/recaptcha/api/siteverify";
    const params = new URLSearchParams({
      secret: RECAPTCHA_SECRET_KEY,
      response: captchaToken,
    });

    const captchaRes = await fetch(verifyURL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString(),
    });

    const captchaResData = (await captchaRes.json()) as CaptchaVerifyResponse;

    if (captchaResData.success) {
      console.log("🟢✅ reCAPTCHA verification successful!");
      return void sendResponse({
        res,
        success: true,
        statusCode: 200,
        message: "reCAPTCHA verification successful.",
        data: { verified: true },
        path: req.originalUrl,
      });
    } else {
      console.warn("🔴❌ reCAPTCHA verification failed:", captchaResData["error-codes"]);

      return void sendResponse({
        res,
        success: false,
        statusCode: 403,
        message: "reCAPTCHA verification failed.",
        errorType: "invalid_captcha",
        errors: {
          captcha: captchaResData["error-codes"] ?? ["Verification failed."],
        },
        path: req.originalUrl,
      });
    }
  } catch (err) {
    console.error("💥⚠️ reCAPTCHA verification error:", err);

    return void sendResponse({
      res,
      success: false,
      statusCode: 500,
      message: "Server error during reCAPTCHA verification.",
      errorType: "server_error",
      errors: { general: ["Unexpected error verifying captcha."] },
      path: req.originalUrl,
    });
  }
});

export default router;
