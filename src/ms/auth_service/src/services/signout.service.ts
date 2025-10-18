import express from 'express';
import { Request, Response } from 'express';
const router = express.Router();

const signoutService = (req: Request, res: Response) => {

  const sameSite = process.env.NODE_ENV === "production" ? "strict" : "lax"

  try{
    res.cookie('WOAH_JWT_TOKEN', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: sameSite,
    path: '/',
    maxAge: 0,
  });

  console.log("🟢 Signed out Successfully")
  return res.status(200).json({ ok: true });
  } catch (err) {
    console.warn("🔴 Error:", err)
    console.warn("🔴 Signout failed")
  }

};

export default signoutService;