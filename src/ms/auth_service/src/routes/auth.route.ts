import { Router } from "express";
import { signupController } from "@controllers/signup.controller";
import { signoutController } from "@controllers/signout.controller";
import { signinController } from "@controllers/signin.controller";
import { refreshTokenController } from "@controllers/refresh_token.controller";

const router = Router();

// Auth routes
router.post("/signup", signupController);
router.post("/signin", signinController);
router.post("/signout", signoutController);
router.post("/refresh", refreshTokenController);

export default router;