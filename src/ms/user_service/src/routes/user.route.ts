import { emailUpdateController } from '@controllers/setuser.controller';
import { usernameUpdateController } from '@controllers/setuser.controller';
import { nameUpdateController } from '@controllers/setuser.controller';
import { passwordUpdateController } from '@controllers/setuser.controller';
import { getUserController } from '@controllers/getuser.controller';
import { Router } from "express";
import { createUserController } from '@controllers/createuser.controller';

const router = Router();

router.patch("/update-user-password", passwordUpdateController);
router.patch("/update-username", usernameUpdateController);
router.patch("/update-user-display-name", nameUpdateController);
router.patch("/update-user-email", emailUpdateController);
router.get("/update-user/:param", getUserController);

router.post("/create", createUserController)

export default router;