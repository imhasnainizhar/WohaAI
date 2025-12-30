import { z } from "zod";
import { signupRegex } from "@regex/auth";

// Here are pieces of schemas for multi-step signup reusablity.

/**
 * Used at API Level
 */
export const SignupInfoSchema = z
  .object({
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

    firstName: z
      .string()
      .min(1, "Required")
      .max(20, "Very Long, Maximum 20 Characters")
      .regex(/^[A-Za-z]+$/, "Only Letters"),

    lastName: z
      .string()
      .min(1, "Required")
      .max(20, "Very Long, Maximum 20 Characters")
      .regex(/^[A-Za-z]+$/, "Only Letters"),

    dateOfBirth: z.date().refine((dob) => {
      const today = new Date();
      const minAge = new Date(
        today.getFullYear() - 14,
        today.getMonth(),
        today.getDate()
      );
      return dob <= minAge;
    }, "Must be at least 14 years old"),
  })

/**
 * Used at personal info step
 */
export const SignupPersonalInfoSchema = z
  .object({
    firstName: z
      .string()
      .min(1, "Required")
      .max(20, "Very Long, Maximum 20 Characters")
      .regex(/^[A-Za-z]+$/, "Only Letters"),

    lastName: z
      .string()
      .min(1, "Required")
      .max(20, "Very Long, Maximum 20 Characters")
      .regex(/^[A-Za-z]+$/, "Only Letters"),

    dateOfBirth: z.date().refine((dob) => {
      const today = new Date();
      const minAge = new Date(
        today.getFullYear() - 14,
        today.getMonth(),
        today.getDate()
      );

      return dob <= minAge;
    }, "Must be at least 14 years old"),
  })

export type SignupPersonalInfoType = z.infer<typeof SignupPersonalInfoSchema>;

/**
 * Used at single email validation step
 */
export const SignupEmailSchema = z.object({
  email: z
    .string()
    .min(1, "Required")
    .email("Invalid Email")
    .refine((val) => !/[<>`'"\\]/.test(val), {
      message: "Invalid Characters",
    }),
})

export type SignupEmailType = z.infer<typeof SignupEmailSchema>;

/**
 * Used at single username validation step
 */
export const SignupUsernameSchema = z.object({
  username: z
    .string()
    .min(1, "Required")
    .max(20, "Very Long, Maximum 20 Characters")
    .regex(/^[A-Za-z0-9 _-]+$/, "Invalid Symbols"),
})

export type SignupUsernameType = z.infer<typeof SignupUsernameSchema>;

/**
 * Union of SignupEmailSchema and SignupUsernameSchema
 */
export const UserInfoZodUnion = z.union([SignupEmailSchema, SignupUsernameSchema]);

export type UserInfoInput = z.infer<typeof UserInfoZodUnion>;

/**
 * Used at password step
 */
export const SignupPasswordSchema = z.object({
  password: z
    .string()
    .min(1, "Required")
    .min(6, "Invalid Password")
    .max(25, "Maximum 25 Characters Long")
    .regex(/^[a-zA-Z0-9 _-]+$/, "Invalid Symbols"),

  confirmPassword: z
    .string()
    .min(1, "Required")
    .max(25, "Maximum 25 Characters Long")
    .regex(/^[a-zA-Z0-9 @$£&_-]+$/, "Invalid Symbols"),

}).refine((data) => data.password === data.confirmPassword, {
  path: ["confirmPassword"],
  message: "Passwords Do Not Match",
})

export type SignupPasswordType = z.infer<typeof SignupPasswordSchema>;

export const SignupCompleteSchema = z.object({
    firstName: z.string().min(1, "Required").max(20, "Very Long, Maximum 20 Characters").regex(/^[A-Za-z]+$/, "Only Letters"),
    lastName: z.string().min(1, "Required").max(20, "Very Long, Maximum 20 Characters").regex(/^[A-Za-z]+$/, "Only Letters"),
    dateOfBirth: z.date().refine((dob) => {
      const today = new Date();
      const minAge = new Date(
        today.getFullYear() - 14,
        today.getMonth(),
        today.getDate()
      );
      return dob <= minAge;
    }, "Must be at least 14 years old"),
    email: z.string().min(1, "Required").email("Invalid Email").refine((val) => !/[<>`'"\\]/.test(val), {
      message: "Invalid Characters",
    }),
    username: z.string().min(1, "Required").max(20, "Very Long, Maximum 20 Characters").regex(/^[A-Za-z0-9 _-]+$/, "Invalid Symbols"),
    password: z.string().min(1, "Required").min(6, "Invalid Password").max(25, "Maximum 25 Characters Long").regex(/^[a-zA-Z0-9 _-]+$/, "Invalid Symbols"),
})