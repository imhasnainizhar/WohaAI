import { Router } from "express";
import { signupController } from "@controllers/index";

const router = Router();

// Auth routes
router.post("/signup", signupController);
// router.post("/signin", signinController);
// router.post("/refresh", refreshTokenController);

export default router;
