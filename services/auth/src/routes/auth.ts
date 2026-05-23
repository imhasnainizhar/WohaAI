import { Router } from "express";
import { getStartedHandler } from "@handlers/signup/get-started";
import { continueWithEmailHandler } from "@handlers/signup/continue/with-email";
import { continueWithUsernameHandler } from "@handlers/signup/continue/with-username";
import { sendVerificationEmailHandler } from "@handlers/signup/verification/send-email";
import { verifyUserEmailHandler } from "@handlers/signup/verification/verify-email";
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