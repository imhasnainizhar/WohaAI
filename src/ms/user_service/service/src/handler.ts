import express, { Request, Response, Router } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import cookieParser from "cookie-parser";
import { prisma } from "@utils/prisma_client";
import { sendResponse } from "@utils/api_response";

const router: Router = express.Router();
router.use(cookieParser());

interface DecodedToken extends JwtPayload {
  sub?: string;
}

router.get("/", async (req: Request, res: Response): Promise<Response> => {
  const token = req.cookies?.__woahai_acc_t;

  // 🍪 No token found in cookies
  console.log(req.cookies)
  console.log(token)
  if (!token) {
    console.warn("⚠️🍪 Missing authentication token in cookies.");
    return sendResponse({
      res,
      success: false,
      message: "Authentication token missing",
      statusCode: 401,
      data: { user: null },
      errorType: "missing_token",
      path: req.originalUrl,
    });
  }

  const JWT_SECRET = process.env.JWT_SECRET;
  if (!JWT_SECRET) {
    console.error("❌🔑 Missing JWT_SECRET in environment variables.");
    return sendResponse({
      res, 
      success: false,
      message: "Server configuration error",
      statusCode: 500,
      data: { user: null },
      errorType: "server_config_error",
      path: req.originalUrl,
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as DecodedToken;

    if (!decoded.sub) {
      console.error("🚫🧩 Token payload missing 'sub' (userID).");
      return sendResponse({
        res,
        success: false,
        message: "Invalid token payload",
        statusCode: 401,
        data: { user: null },
        errorType: "invalid_payload",
        path: req.originalUrl,
      });
    }

    const user = await prisma.user.findUnique({
      where: { userID: decoded.sub },
      select: { userID: true, email: true, userFirstName: true, userLastName: true },
    });

    if (!user) {
      console.warn("🔴 User not found in database.");
      return sendResponse({
        res,
        success: false,
        message: "User not found",
        statusCode: 404,
        data: { user: null },
        errorType: "user_not_found",
        path: req.originalUrl,
      });
    }

    console.log("✅ User authenticated successfully!");
    return sendResponse({
      res,
      success: true,
      message: "User authenticated successfully",
      statusCode: 200,
      data: {
        user: {
          userID: user.userID,
          email: user.email,
          firstName: user.userFirstName,
          lastName: user.userLastName,
        },
      },
      path: req.originalUrl,
    });
  } catch (err: any) {
    if (err.name === "TokenExpiredError") {
      console.warn("⏰ Token expired.");
      return sendResponse({
        res,
        success: false,
        message: "Session expired",
        statusCode: 401,
        data: { user: null },
        errorType: "token_expired",
        path: req.originalUrl,
      });
    }

    console.error("💥❌ Token verification failed:", err);
    return sendResponse({
      res,
      success: false,
      message: "Invalid or expired token",
      statusCode: 401,
      data: { user: null },
      errorType: "invalid_token",
      path: req.originalUrl,
    });
  }
});

export default router;
