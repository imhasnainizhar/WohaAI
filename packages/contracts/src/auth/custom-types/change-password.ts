import z from "zod";
import { ChangePasswordRequestSchema } from "../schema/change-password";

export type ChangePasswordRequest = z.infer<typeof ChangePasswordRequestSchema>