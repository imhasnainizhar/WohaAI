import { Router } from "express";
import { signupInitController } from '../handlers/signup_init';
import { confirmUserEmailController } from '../handlers/signup';
import { signoutController } from "../handlers/signout";
import { signinController } from "../handlers/signin";
import { refreshTokenController } from "../handlers/refresh_token";
import { generateVerificationCodeController } from "../handlers/generate_code";
import { validateEmailController } from '../handlers/signup';
import { validatePasswordController } from '../handlers/signup';
import { validateDisplayNameController } from "../handlers/signup";

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