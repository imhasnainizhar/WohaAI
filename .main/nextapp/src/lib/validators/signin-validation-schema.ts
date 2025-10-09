import { z } from 'zod';

export const signInSchema = z.object({
    email: z.string().min(1, "*Required")
    .email("Invalid Email")
    .refine((val) => !/[<>`'"\\]/.test(val), {
        message: "Invalid Characters"
      }),
    password: z.string().min(1, "*Required")
    .min(6, "Invalid Password")
    .max(20, "Very Long, Maximum 20 Characters")
    .max(25, "Maximum 25 Characters Long")
    .regex(/^[a-zA-Z0-9 _-]+$/, "Invalid Symbols"),
    rememberMe: z.boolean().optional(),
});
  