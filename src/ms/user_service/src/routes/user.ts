import { emailUpdateController } from '@controllers/setuser';
import { usernameUpdateController } from '@controllers/setuser';
import { nameUpdateController } from '@controllers/setuser';
import { passwordUpdateController } from '@controllers/setuser';
import { getUserController } from '@controllers/getuser';
import { Router } from "express";
import { createUserController } from '@controllers/createuser';

const router = Router();

router.patch("/update-user-password", passwordUpdateController);
router.patch("/update-username", usernameUpdateController);
router.patch("/update-user-display-name", nameUpdateController);
router.patch("/update-user-email", emailUpdateController);
router.get("/update-user/:param", getUserController);

router.post("/create", createUserController)

export default router;