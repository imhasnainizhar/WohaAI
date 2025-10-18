import { Router } from "express";
import { signoutController, signupController } from "@controllers/index";
import { signinController } from "@controllers/index";

const router = Router();

// Auth routes
router.post("/signup", signupController);
router.post("/signin", signinController);
router.post("/signout", signoutController);
// router.post("/refresh", refreshTokenController);

export default router;
