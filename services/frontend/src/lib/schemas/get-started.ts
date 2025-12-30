import { z } from "zod";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const usernameRegex = /^[A-Za-z0-9_]{3,}$/;

export const GetStartedSchema = z.object({
    usernameOrEmail: z
        .string()
        .min(1, "Required")
        .transform((val, ctx) => {
            if (emailRegex.test(val)) {
                return { type: "email" as const, value: val };
            }
            if (usernameRegex.test(val)) {
                return { type: "username" as const, value: val };
            }

            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "Must be a valid username or email",
            });

            return z.NEVER;
        }),
});

export type GetStartedType = z.infer<typeof GetStartedSchema>;
