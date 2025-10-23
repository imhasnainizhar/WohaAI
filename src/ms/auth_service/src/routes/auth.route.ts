import { Router } from "express";
import { signupInitController } from './../controllers/signup_init.controller';
import { confirmUserEmailController } from '@controllers/signup.controller';
import { signoutController } from "@controllers/signout.controller";
import { signinController } from "@controllers/signin.controller";
import { refreshTokenController } from "@controllers/refresh_token.controller";
import { generateVerificationCodeController } from "@controllers/generate_code.controller";
import { validateEmailController } from '@controllers/signup.controller';
import { validatePasswordController } from '@controllers/signup.controller';
import { validateDisplayNameController } from "@controllers/signup.controller";

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