import express, { Request, Response, Router } from "express";
import jwt from "jsonwebtoken";
import cookieParser from "cookie-parser";
import { prisma } from "@utils/prisma_client";

const router: Router = express.Router();

router.use(cookieParser());

router.get("/", async (req: Request, res: Response) => {
  const token = req.cookies?.odeysent_session;

  if (!token) {
    return void res.status(401).json({ user: null });
  }

  const JWT_SECRET = process.env.JWT_SECRET;
  if (!JWT_SECRET) {
    console.error("JWT_SECRET is not set");
    return void res.status(500).json({ user: null });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    if (typeof decoded !== "object" || !decoded.sub) {
      console.error("Missing `sub` in JWT payload");
      return void res.status(401).json({ user: null });
    }

    const user = await prisma.user.findUnique({
      where: { userID: decoded.sub },
    });

    if (!user) {
      return void res.status(401).json({ user: null });
    }

    return void res.status(200).json({
      user: {
        userID: user.userID,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
      },
    });
  } catch (err) {
    console.error("JWT decode error:", err);
    return void res.status(401).json({ user: null });
  }
});

export default router;
