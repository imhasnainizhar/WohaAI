import z from "zod";
import { PasswordSchema, UsernameOrEmailSchema } from "../../user/schemas/fields";

export const SigninInitRequestSchema = z.object({
    usernameOrEmail: UsernameOrEmailSchema,
});

export const SigninCompleteRequestSchema = z.object({
    password: PasswordSchema,
});