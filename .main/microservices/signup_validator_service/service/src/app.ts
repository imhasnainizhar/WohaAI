import express from "express";
import { signUpSchema } from "@utils/signup_vlidation_schema";
import { prisma } from "@utils/prisma_client"; // assuming default export

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const parsed = signUpSchema.parse(req.body);
    const { email } = parsed;

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return void res.status(200).json({ emailExist: true });
    }

    return void res.status(200).json({ ok: true });
  } catch (err) {
    console.error("Signup validation error or DB failure:", err);
    return void res.status(400).json({ error: true });
  }
});

export default router;
