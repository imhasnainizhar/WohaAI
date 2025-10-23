import { z } from "zod"

export const displayNameSchema = z
  .object({
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

  })

export type DisplayName = z.infer<typeof displayNameSchema>;

export const usernameSchema = z
  .object({
    username: z
      .string()
      .trim()
      .min(3, "Username must be at least 3 characters.")
      .max(30, "Username must be at most 30 characters.")
      .regex(/^[a-zA-Z0-9._-]+$/, "Username Contains Invalid Characters"),
  })

export type UserName = z.infer<typeof usernameSchema>;


export const emailSchema = z
  .object({
    email: z
      .string()
      .trim()
      .email("Invalid email format.")
      .refine((val) => !/[<>`'"\\]/.test(val), {
        message: "Invalid Characters",
      }),
  })

  export type Email = z.infer<typeof emailSchema>;

export const passwordSchema = z
  .object({
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
  }).refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords Do Not Match",
  })

    export type Password = z.infer<typeof passwordSchema>;


export const rememberMeSchema = z
  .object({
    rememberMe: z.boolean().optional(),
  })
export type RememberMe = z.infer<typeof rememberMeSchema>;

