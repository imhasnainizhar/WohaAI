import { refreshSessionHandler } from "@/handlers/refresh-session";
import { signinHandler } from "@/handlers/signin";
import { signoutHandler } from "@/handlers/signout";
import { completeSignupHandler } from "@/handlers/signup/complete";
import { continueWithEmailHandler } from "@/handlers/signup/continue/with-email";
import { continueWithUsernameHandler } from "@/handlers/signup/continue/with-username";
import { signupInitHandler } from "@/handlers/signup/init";
import { NameValidationHandler } from "@/handlers/signup/validations/name";
import { PasswordValidationHandler } from "@/handlers/signup/validations/password";
import { sendVerificationEmailHandler } from "@/handlers/signup/verification/send-verification-email";
import { verifyUserEmailHandler } from "@/handlers/signup/verification/verify-user-email";
import { Router } from "express";


const router: Router = Router();

// Auth routes
router.post("/signin", signinHandler);
router.post("/refresh-session", refreshSessionHandler);
router.post("/signout", signoutHandler);


router.post("/signup-init", signupInitHandler);
router.post("/continue-with-email", continueWithUsernameHandler);
router.post("/continue-with-username", continueWithEmailHandler);
router.post("/send-verification-email", sendVerificationEmailHandler);
router.post("/verify-user-email", verifyUserEmailHandler);
router.post("/validate-names", NameValidationHandler);
router.post("/validate-password", PasswordValidationHandler);
router.post("/signup-complete", completeSignupHandler);

export default router;