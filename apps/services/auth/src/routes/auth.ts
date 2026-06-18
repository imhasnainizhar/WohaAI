import { requestEmailChangeHandler } from "@/handlers/change-email";
import { verifyEmailChangeHandler } from "@/handlers/change-email";
import { refreshSessionHandler } from "@/handlers/refresh-session";
import { signoutHandler } from "@/handlers/signout";
import { completeSignupHandler } from "@/handlers/signup/complete";
import { signupEmailValidationHandler } from "@/handlers/signup/email";
import { signupUsernameValidationHandler } from "@/handlers/signup/username";
import { passwordValidationHandler } from "@/handlers/signup/password";
import { sendVerificationEmailHandler } from "@/handlers/signup/verification/send-verification-email";
import { verifyUserEmailHandler } from "@/handlers/signup/verification/verify-user-email";
import { disable2FAHandler } from "@/handlers/two-fa/disable";
import { enable2FAHandler } from "@/handlers/two-fa/enable";
import { generate2FASecretHandler } from "@/handlers/two-fa/generate";
import { verify2FAHandler } from "@/handlers/two-fa/verify";
import { changePasswordInitHandler } from "@/handlers/change-password/init";
import { verifyChangePasswordHandler } from "@/handlers/change-password/verify";
import { completeChangePasswordHandler } from "@/handlers/change-password/change-password";
import { signinInitHandler, signinCompleteHandler } from "@/handlers/signin";
import { Router } from "express";
import { signupInitHandler } from '@/handlers/signup/init';


const router: Router = Router();

// Signin routes
router.post("/signin/init", signinInitHandler);
router.post("/signin/complete", signinCompleteHandler);

// Refresh session route
router.post("/refresh-session", refreshSessionHandler);

// Signout route
router.post("/signout", signoutHandler);

// Signup routes
router.post("/signup/init", signupInitHandler);
router.post("/signup/email-validation", signupEmailValidationHandler);
router.post("/signup/username-validation", signupUsernameValidationHandler);
router.post("/signup/send-verification-email", sendVerificationEmailHandler);
router.post("/signup/verify-user-email", verifyUserEmailHandler);
router.post("/signup/validate-password", passwordValidationHandler);
router.post("/signup/complete", completeSignupHandler);

// Two-factor authentication routes
router.post("/2fa/generate-secret", generate2FASecretHandler);
router.post("/2fa/verify-totp", verify2FAHandler);
router.post("/2fa/enable", enable2FAHandler);
router.post("/2fa/disable", disable2FAHandler);
router.post("/change-email/request", requestEmailChangeHandler)
router.post("/change-email/verify", verifyEmailChangeHandler)

// Change password routes
router.post("/change-password/init", changePasswordInitHandler)
router.post("/change-password/verify", verifyChangePasswordHandler)
router.post("/change-password/complete", completeChangePasswordHandler)

export default router;