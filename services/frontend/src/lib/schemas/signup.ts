import { z } from "zod";

export const SignupPersonalInfoSchema = z
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

    date: z.date({
      required_error: "*Required",
      invalid_type_error: "Invalid Date",
    }),
  })

export type SignupPersonalInfoInput = z.infer<typeof SignupPersonalInfoSchema>;

export const SignupEmailSchema = z.object({
  email: z
    .string()
    .min(1, "*Required")
    .email("Invalid Email")
    .refine((val) => !/[<>`'"\\]/.test(val), {
      message: "Invalid Characters",
    }),
})

export type SignupEmailInput = z.infer<typeof SignupEmailSchema>;

export const SignupUsernameSchema = z.object({
  username: z
    .string()
    .min(1, "*Required")
    .max(20, "Very Long, Maximum 20 Characters")
    .regex(/^[A-Za-z0-9 _-]+$/, "Invalid Symbols"),
})

export type SignupUsernameInput = z.infer<typeof SignupUsernameSchema>;

export const SignupPasswordSchema = z.object({
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

export type SignupPasswordInput = z.infer<typeof SignupPasswordSchema>;
