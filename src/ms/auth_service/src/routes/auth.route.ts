import { verifyCodeController } from './../controllers/verify_code.controller';
import { Router } from "express";
import { signupController } from "@controllers/signup.controller";
import { signoutController } from "@controllers/signout.controller";
import { signinController } from "@controllers/signin.controller";
import { refreshTokenController } from "@controllers/refresh_token.controller";
import { 
    validateDisplayNameController, 
    validateEmailController, 
    validatePasswordController, 
    validateUsernameController 
} from "@controllers/signup_validation.controller";
import { generateVerificationCodeController } from "@controllers/generate_code.controller";

const router = Router();

// Auth routes
router.post("/signup", signupController);
router.post("/signin", signinController);
router.post("/signout", signoutController);
router.post("/refresh", refreshTokenController);

router.post("/validate-display-name", validateDisplayNameController);
router.post("/validate-username", validateUsernameController);
router.post("/validate-email", validateEmailController);
router.post("/validate-password", validatePasswordController);

router.get("/email-verification-code", generateVerificationCodeController);
router.post("/verify-code", verifyCodeController);

export default router;