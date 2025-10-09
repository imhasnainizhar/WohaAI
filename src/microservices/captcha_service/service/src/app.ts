import express from "express";

const router = express.Router();

router.post("/", async (req, res) => {
  const { captchaToken } = req.body;
  const RECAPTCHA_SECRET_KEY = process.env.RECAPTCHA_SECRET_KEY;

  if (!RECAPTCHA_SECRET_KEY || !captchaToken) {
    return res.status(400).json({ success: false, message: "Missing data" });
  }

  const verifyURL = `https://www.google.com/recaptcha/api/siteverify?secret=${RECAPTCHA_SECRET_KEY}&response=${captchaToken}`;

  try {
    const captchaRes = await fetch(verifyURL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    });

    const captchaResData = await captchaRes.json();

    if (captchaResData.success) {
      return res.status(200).json({ success: true });
    } else {
      return res.status(403).json({ success: false, errors: captchaResData["error-codes"] });
    }
  } catch (err) {
    console.error("Captcha verification failed:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
});

export default router;
