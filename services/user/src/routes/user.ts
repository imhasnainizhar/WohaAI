import { createUserHandler } from "@/handlers/create-user";
import { getMeHandler } from "@/handlers/get-user";
import { updateUserHandler } from "@/handlers/update-user";
import { Router } from "express";

const router: Router = Router();

router.patch("/update-user", updateUserHandler);
router.patch("/create-user", createUserHandler);
router.patch("/get-me", getMeHandler);

export default router;