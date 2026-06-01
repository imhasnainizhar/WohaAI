import z from "zod";
import { CreateUserSchema } from "../schemas/create-user";

export type CreateUser = z.infer<typeof CreateUserSchema>

export interface CreateUserResponse {
    userCreated: boolean;
}