import { getUserByUsernameController } from '@controllers/getuser.controller';
import { emailUpdateController } from '@controllers/user.controller';
import { usernameUpdateController } from '@controllers/user.controller';
import { nameUpdateController } from '@controllers/user.controller';
import { passwordUpdateController } from '@controllers/user.controller';
import { getUserByIdController } from '@controllers/getuser.controller';
import { Router } from "express";

const router = Router();

router.post("/update-user-password", passwordUpdateController);
router.post("/update-username", usernameUpdateController);
router.post("/update-user-display-name", nameUpdateController);
router.post("/update-user-email", emailUpdateController);
router.post("/update-user/:id", getUserByIdController);
router.post("/update-user/:username", getUserByUsernameController);

export default router;