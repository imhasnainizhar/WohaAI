import express, { Request, Response } from "express";
import { signUpSchema } from "@utils/signup_vlidation_schema";
import { prisma } from "@utils/prisma_client";
import { sendResponse } from "@utils/api_response";

const router = express.Router();

router.post("/", async (req: Request, res: Response): Promise<Response> => {
  try {
    console.log("🟢 [SIGNUP_VALIDATOR] Request received");

    // Validate input
    const parsed = signUpSchema.safeParse(req.body);
    if (!parsed.success) {
      const flattened = parsed.error.flatten();
      console.warn("⚠️ [SIGNUP_VALIDATOR] Validation failed:", flattened.fieldErrors);

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

    const { email, username } = parsed.data;
    console.log("✅ [SIGNUP_VALIDATOR] Input validated for:", email);

    // Check if user exists
    const existingUser = await prisma.user.findUnique({ where: { username } });
    if (existingUser) {
      console.warn("⚠️ [SIGNUP_VALIDATOR] Username already taken:", username);
      return sendResponse({
        res,
        success: false,
        statusCode: 409,
        message: "Username already taken",
        errors: { Username: ["Username already taken"] },
        errorType: "user_not_available",
        path: req.path,
      });
    }

    console.log(`🆗 [SIGNUP_VALIDATOR] Username ${username} available`);

    const existingEmail = await prisma.user.findUnique({ where: { email } });
    if (existingEmail) {
      console.warn("⚠️ [SIGNUP_VALIDATOR] Email already exists:", email);
      return sendResponse({
        res,
        success: false,
        statusCode: 409,
        message: "Email already registered",
        errors: { email: ["Email already exists"] },
        errorType: "conflict_error",
        path: req.path,
      });
    }

    console.log(`🆗 [SIGNUP_VALIDATOR] Email ${email} available`);

    console.log("🎉 [SIGNUP_VALIDATOR] ");

    return sendResponse({
      res,
      success: true,
      statusCode: 201,
      message: "Email is available",
      data: { email },
      path: req.path,
    });

  } catch (err: unknown) {
    if (err instanceof Error) {
      console.error("🔥 [ERROR] Internal Server Error in /signup route:", err.message);
    } else {
      console.error("🚨 [UNEXPECTED ERROR TYPE]:", err);
    }

    return sendResponse({
      res,
      success: false,
      message: "Something went wrong on our side",
      errorType: "internal_server_error",
      statusCode: 500,
      path: req.path,
    });
  }
});

export default router;
