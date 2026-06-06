import z from "zod";
import { PasswordSchema, UsernameOrEmailSchema } from "./fields";

export const SigninRequestSchema = z.object({
    usernameOrEmail: UsernameOrEmailSchema,

    rememberMe: z
        .boolean(),
    
    password: PasswordSchema,
});