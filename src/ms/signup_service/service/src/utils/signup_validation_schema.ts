import { z } from "zod";

export const signUpSchema = z
  .object({
    email: z
      .string()
      .trim()
      .email("Invalid email format.")
      .refine((val) => !/[<>`'"\\]/.test(val), {
        message: "Invalid Characters",
      }),
    username: z
      .string()
      .trim()
      .min(3, "Username must be at least 3 characters.")
      .max(30, "Username must be at most 30 characters.")
      .regex(/^[a-zA-Z0-9._-]+$/, "Username Contains Invalid Characters"),
    firstName: z
      .string()
      .min(1, "*Required")
      .max(20, "Very Long, Maximum 20 Characters")
      .regex(/^[A-Za-z]+$/, "Only Letters"),

    lastName: z
      .string()
      .min(1, "*Required")
      .max(20, "Very Long, Maximum 20 Characters")
      .regex(/^[A-Za-z]+$/, "Only Letters"),
    password: z
      .string()
      .min(1, "*Required")
      .min(6, "Invalid Password")
      .max(25, "Maximum 25 Characters Long")
      .regex(/^[a-zA-Z0-9 _-]+$/, "Invalid Symbols"),

    confirmPassword: z
      .string()
      .min(1, "*Required")
      .max(25, "Maximum 25 Characters Long")
      .regex(/^[a-zA-Z0-9 @$£&_-]+$/, "Invalid Symbols"),

    rememberMe: z.boolean().optional(),
  })

  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords Do Not Match",
  }
  )