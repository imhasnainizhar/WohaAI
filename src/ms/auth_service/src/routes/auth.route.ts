import { Router } from "express";
import { signoutController, signupController } from "@controllers/auth.controller";
import { signinController } from "@controllers/auth.controller";
import { refreshTokenController } from "@controllers/auth.controller";

const router = Router();

// Auth routes
router.post("/signup", signupController);
router.post("/signin", signinController);
router.post("/signout", signoutController);
router.post("/refresh", refreshTokenController);

export default router;