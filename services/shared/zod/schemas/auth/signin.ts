import { z } from 'zod';
import { signupRegex } from "@regex/auth";

/**
 * Used at API Level
 */
export const signInSchema = z.object({
  usernameOrEmail: z
    .string()
    .min(1, "Required")
    .transform((val, ctx) => {
      if (signupRegex.emailRegex.test(val)) {
        return { type: "email" as const, value: val };
      }
      if (signupRegex.usernameRegex.test(val)) {
        return { type: "username" as const, value: val };
      }

      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Must be a valid username or email",
      });

      return z.NEVER;
    }),

  password: z.string().min(1, "Required")
    .min(6, "Invalid Password")
    .max(25, "Maximum 25 Characters Long")
    .regex(/^[a-zA-Z0-9 _-]+$/, "Invalid Symbols"),
});

export type SignInType = z.infer<typeof signInSchema>;