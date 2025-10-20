import express from "express";
import { MailerController } from "@controllers/mailer.controller";

const router = express.Router();

router.post("/send-verification", MailerController.sendVerification);
router.post("/send-password-reset", MailerController.sendPasswordReset);

export default router;
