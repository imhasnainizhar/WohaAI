import { Router } from "express";
import { signupInitController } from '../controllers/signup_init';
import { confirmUserEmailController } from '@controllers/signup';
import { signoutController } from "@controllers/signout";
import { signinController } from "@controllers/signin";
import { refreshTokenController } from "@controllers/refresh_token";
import { generateVerificationCodeController } from "@controllers/generate_code";
import { validateEmailController } from '@controllers/signup';
import { validatePasswordController } from '@controllers/signup';
import { validateDisplayNameController } from "@controllers/signup";

const router = Router();

// Auth routes
router.post("/signin", signinController);
router.post("/signout", signoutController);
router.post("/refresh", refreshTokenController);

router.post("/init-signup", signupInitController);
router.post("/validate-display-name", validateDisplayNameController);
router.post("/validate-email", validateEmailController);
router.post("/validate-password", validatePasswordController);

router.get("/generate-verification-code", generateVerificationCodeController);
router.post("/verify-email", confirmUserEmailController);

export default router;