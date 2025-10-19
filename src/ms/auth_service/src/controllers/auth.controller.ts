import { Request, Response } from "express";
import { prisma } from "@utils/prisma_client"; // your Prisma client instance
import { logger } from "@utils/logger";
import { sendResponse } from "@utils/api_response";

export const signoutService = async (req: Request, res: Response) => {
  // Ensure sameSite has correct literal type
  const sameSite: "strict" | "lax" = process.env.NODE_ENV === "production" ? "strict" : "lax";
  const userID = req.body?.userID;

  if (!userID) {
    logger.warn({ path: req.path }, "⚠️ [SIGNOUT] Missing userID in request body");
    return sendResponse({
      res,
      success: false,
      message: "Missing user ID",
      statusCode: 400,
      errorType: "bad_request",
      path: req.path,
    });
  }

  try {
    // Revoke all non-revoked refresh tokens for the user
    await prisma.refreshToken.updateMany({
      where: { userId: userID, revoked: false },
      data: { revoked: true, revokedAt: new Date() },
    });

    // Cookie options
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite,
      path: "/",
      maxAge: 0,
    } as const;

    // Clear client-side cookies
    res.cookie("__woahai_acc_t", "", cookieOptions);
    res.cookie("__woahai_ref_t", "", cookieOptions);
    res.cookie("__woahai_private_acc_t", "", cookieOptions);

    // Log successful signout
    logger.info({ path: req.path, userID }, "🟢 [SIGNOUT] Signed out successfully");

    return sendResponse({
      res,
      message: "Signed out successfully",
      path: req.path,
    });
  } catch (err: any) {
    // Log failure
    logger.error({ path: req.path, userID, error: err.message }, "❌ [SIGNOUT] Signout failed");

    return sendResponse({
      res,
      success: false,
      message: "Internal server error during signout",
      errorType: "internal_server_error",
      path: req.path,
      statusCode: 500,
    });
  }
};
