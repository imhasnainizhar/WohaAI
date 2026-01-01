import { z } from "zod";
import { signupRegex } from "@regex/auth";

export const GetStartedSchema = z.object({
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
});

export type GetStartedType = z.infer<typeof GetStartedSchema>;