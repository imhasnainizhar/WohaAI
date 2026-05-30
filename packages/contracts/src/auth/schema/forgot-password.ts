import { authRegex } from "../../utils/auth-regex";
import z from "zod";
import { PasswordSchema } from "./user";

export const ForgotPasswordInitRequestSchema = z.object({
    forgotPasswordUsernameOrEmail: z
        .string()
        .min(1, "Required")
        .transform((val, ctx) => {
            if (authRegex.emailRegex.test(val)) {
                return { type: "email" as const, value: val };
            }
            if (authRegex.usernameRegex.test(val)) {
                return { type: "username" as const, value: val };
            }

            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Must be a valid username or email",
            });

            return z.NEVER;
        }),
});

export const ChangeForgottenPasswordRequestSchema = z.object({
    password: PasswordSchema
})