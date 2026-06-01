import z from "zod";
import { UpdateUserSchema } from "../schemas/update-user";

export type UpdateUser = z.infer<typeof UpdateUserSchema>

export interface UpdateUserResponse {
    userUpdated: boolean;
}