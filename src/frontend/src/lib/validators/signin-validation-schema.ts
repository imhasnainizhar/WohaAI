import { z } from 'zod';

export const signInSchema = z.object({
  email: z
    .string()
    .trim()
    .email("Invalid email format.")
    .refine((val) => !/[<>`'"\\]/.test(val), {
      message: "Invalid Characters",
    })
    .optional(),
  username: z
    .string()
    .trim()
    .min(3, "Username must be at least 3 characters.")
    .max(30, "Username must be at most 30 characters.")
    .regex(/^[a-zA-Z0-9._-]+$/, "Username Contains Invalid Characters")
    .optional(),
  password: z.string().min(1, "*Required")
    .min(6, "Invalid Password")
    .max(20, "Very Long, Maximum 20 Characters")
    .max(25, "Maximum 25 Characters Long")
    .regex(/^[a-zA-Z0-9 _-]+$/, "Invalid Symbols"),
  rememberMe: z.boolean().optional(),

});
  