import { Router } from "express";
import { getStartedHandler } from "@handlers/signup/get_started";
import { continueWithEmailHandler } from "@handlers/signup/continue/with_email";
import { continueWithUsernameHandler } from "@handlers/signup/continue/with_username";
import { sendVerificationEmailHandler } from "@handlers/signup/verification/send_email";
import { verifyUserEmailHandler } from "@handlers/signup/verification/verify_email";
import { completeSignupHandler } from "@handlers/signup/complete";

const router = Router();

// Auth routes
router.post("/get-started", getStartedHandler);
router.post("/continue/with-email", continueWithEmailHandler);
router.post("/continue/with-username", continueWithUsernameHandler);
router.post("/send-verification-email", sendVerificationEmailHandler);
router.post("/verify-user-email", verifyUserEmailHandler);
router.post("/complete-signup", completeSignupHandler);


export default router;