import z from "zod";
import { PasswordSchema, UsernameOrEmailSchema } from "./fields";

export const SigninInitRequestSchema = z.object({
    usernameOrEmail: UsernameOrEmailSchema,
});

export const SigninCompleteSchema = z.object({
    password: PasswordSchema,
});