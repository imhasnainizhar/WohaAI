import express from "express";
import dotenv from "dotenv";
import { sendVerificationEmail } from "@mailer/code_mailer";
import generateVerificationCode from "@utils/generateVerificationCode";
import redisClient from "@utils/redis_client";

dotenv.config(); 

const router = express.Router();

router.post("/api/verify", async (req, res) => {
  try {
    const { email } = req.body;
    console.log(req.body);
    console.log(email);

    if (!email || typeof email !== "string") {
      return res.status(400).json({ error: "Invalid email" });
    }

    const verificationCode = generateVerificationCode();
    const key = `verify:${email}`;
    const ttl = 300; // 5 minutes

    console.log(key, verificationCode);

    await redisClient.set(key, verificationCode, "EX", ttl);

    console.log({
      EMAIL_USER: process.env.EMAIL_USER,
      EMAIL_PASS: process.env.EMAIL_PASS ? "✅ set" : "❌ missing",
    });

    await sendVerificationEmail(email, verificationCode);

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("Error sending verification email:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

export default router;
