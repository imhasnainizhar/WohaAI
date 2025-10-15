import express, { Request, Response } from "express";
import { signUpSchema } from "@utils/signup_vlidation_schema";
import { prisma } from "@utils/prisma_client";
import { sendResponse } from "@utils/api_response";

const router = express.Router();

router.post("/", async (req: Request, res: Response): Promise<Response> => {
  try {
    console.log("🟢 [SIGNUP_VALIDATOR] Request received"); // Incoming request logged

    // 📝 Validate the request body using Zod schema
    const parsed = signUpSchema.safeParse(req.body);
    if (!parsed.success) {
      const flattened = parsed.error.flatten();
      console.warn("⚠️ [SIGNUP_VALIDATOR] Validation failed:", flattened.fieldErrors);

      // ❌ Return validation errors to client
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

    // 🔍 Check if username or email already exists in DB
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }],
      },
    });

    if (existingUser) {
      const usernameTaken = existingUser.username === username;
      const emailTaken = existingUser.email === email;

      // 🚫 Both username & email already exist
      if (usernameTaken && emailTaken) {
        console.log(`🔴 Username ${username} and email ${email} are not available`);
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

      // 🚫 Only username exists
      if (usernameTaken) {
        console.log(`🔴 Username ${username} is not available`);
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

      // 🚫 Only email exists
      if (emailTaken) {
        console.log(`🔴 Email ${email} is not available`);
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

    // ✅ Neither username nor email exists — safe to proceed
    console.log(`🆗 [SIGNUP_VALIDATOR] Username ${username} available`);
    console.log(`🆗 [SIGNUP_VALIDATOR] Email ${email} available`);
    console.log("🎉 [SIGNUP_VALIDATOR] Validation successful");

    // 💾 Return success response to client
    return sendResponse({
      res,
      success: true,
      statusCode: 201,
      message: "Username and email are available",
      data: { email, username },
      path: req.path,
    });

  } catch (err: unknown) {
    // 🔥 Catch unexpected errors
    if (err instanceof Error) {
      console.error("🔴 [ERROR] Internal Server Error in /signup route:", err.message);
    } else {
      console.error("❌ [UNEXPECTED ERROR TYPE]:", err);
    }

    // ❌ Return generic server error response
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
