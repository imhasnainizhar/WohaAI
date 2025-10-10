import { z } from "zod";

export const signUpSchema = z
  .object({
    FirstName: z
      .string()
      .min(1, "*Required")
      .max(20, "Very Long, Maximum 20 Characters")
      .regex(/^[A-Za-z]+$/, "Only Letters"),

    LastName: z
      .string()
      .min(1, "*Required")
      .max(20, "Very Long, Maximum 20 Characters")
      .regex(/^[A-Za-z]+$/, "Only Letters"),

    email: z
      .string()
      .min(1, "*Required")
      .email("Invalid Email")
      .refine((val) => !/[<>`'"\\]/.test(val), {
        message: "Invalid Characters",
      }),
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