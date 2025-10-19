import { Request, Response } from "express";
import { logger } from "@utils/logger";

export const signoutService = (req: Request, res: Response) => {
  // Determine cookie SameSite policy based on environment
  const sameSite = process.env.NODE_ENV === "production" ? "strict" : "lax";

  try {
    /**
     * Clear the JWT cookie by setting an empty value and maxAge 0.
     * This ensures the token is invalidated on the client-side.
     * HttpOnly and Secure flags are kept for security.
     */
    res.cookie("__woahai_acc_t", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite,
      path: "/",
      maxAge: 0,
    });

    res.cookie("__woahai_ref_t", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite,
      path: "/",
      maxAge: 0,
    });

    res.cookie("__woahai_private_acc_t", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite,
      path: "/",
      maxAge: 0,
    });

    // Successful logout
    logger.info({ path: req.path, userID: req.body?.userID }, "🟢 [SIGNOUT] Signed out successfully");
    return res.status(200).json({ ok: true });
  } catch (err: any) {
    // Internal server error during signout
    logger.error({ path: req.path, error: err.message }, "❌ [SIGNOUT] Signout failed");
    return res.status(500).json({
      ok: false,
      message: "Internal server error during signout",
    });
  }
};
