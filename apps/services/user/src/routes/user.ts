import { createUserHandler } from "@/handlers/create-user";
import { getMeHandler } from "@/handlers/get-me";
import { updateProfilePicHandler } from "@/handlers/update-profile-pic";
import { updateUsernameHandler } from "@/handlers/update-username";
import { updateFullNameHandler } from "@/handlers/update-name";
import { updateDOBHandler } from "@/handlers/update-dob";
import { Router } from "express";

const router: Router = Router();

router.patch("/update/profile-pic", updateProfilePicHandler);
router.patch("/update/username", updateUsernameHandler);
router.patch("/update/fullname", updateFullNameHandler);
router.patch("/update/dob", updateDOBHandler);
router.patch("/create/user", createUserHandler);
router.patch("/get/me", getMeHandler);

export default router;