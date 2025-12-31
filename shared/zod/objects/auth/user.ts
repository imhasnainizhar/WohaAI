// fields.ts
import { z } from "zod";

/**
 * First name field definition for zod schema
 */
export const FirstName = z
  .string()
  .min(1, "Required")
  .max(20, "Very Long, Maximum 20 Characters")
  .regex(/^[A-Za-z]+$/, "Only Letters");

/**
 * Last name field definition for zod schema
 */
export const LastName = z
  .string()
  .min(1, "Required")
  .max(20, "Very Long, Maximum 20 Characters")
  .regex(/^[A-Za-z]+$/, "Only Letters");


/**
 * Username field definition for zod schema
 */
export const Username = z
  .string()
  .min(1, "Required")
  .max(20, "Very Long, Maximum 20 Characters")
  .regex(/^[A-Za-z0-9 _-]+$/, "Invalid Symbols");

/**
 * Email field definition for zod schema
 */
export const Email = z
  .string()
  .min(1, "Required")
  .email("Invalid Email")
  .refine((val) => !/[<>`'"\\]/.test(val), {
    message: "Invalid Characters",
  });

/**
 * Date of birth field definition for zod schema
 */
export const DateOfBirth = z
  .string()
  .refine((val) => !isNaN(Date.parse(val)), "Invalid date")
  .transform((val) => new Date(val))
  .refine((dob) => {
    const today = new Date();
    const minAge = new Date(
      today.getFullYear() - 14,
      today.getMonth(),
      today.getDate()
    );
    return dob <= minAge;
  }, "Must be at least 14 years old");

/**
 * Password field definition for zod schema
 */
export const Password = z
  .string()
  .min(6, "Minimum 6 Characters Long")
  .max(25, "Maximum 25 Characters Long")
  .regex(/^[a-zA-Z0-9 _-]+$/, "Invalid Symbols");

/**
 * Confirm password field definition for zod schema
 */
export const ConfirmPassword = z
  .string()
  .min(6, "Minimum 6 Characters Long")
  .max(25, "Maximum 25 Characters Long")
  .regex(/^[a-zA-Z0-9 _-]+$/, "Invalid Symbols");


export type FirstNameType = z.infer<typeof FirstName>;
export type LastNameType = z.infer<typeof LastName>;
export type UsernameType = z.infer<typeof Username>;
export type EmailType = z.infer<typeof Email>;
export type DateOfBirthType = z.infer<typeof DateOfBirth>;
export type PasswordType = z.infer<typeof Password>;
export type ConfirmPasswordType = z.infer<typeof ConfirmPassword>;