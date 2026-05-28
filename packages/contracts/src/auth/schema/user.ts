import { z } from "zod";

/**
 * First name field definition for zod schema
 */
export const FirstNameSchema = z
  .string()
  .min(1, "Required")
  .max(20, "Very Long, Maximum 20 Characters")
  .regex(/^[A-Za-z]+$/, "Only Letters");

/**
 * Last name field definition for zod schema
 */
export const LastNameSchema = z
  .string()
  .min(1, "Required")
  .max(20, "Very Long, Maximum 20 Characters")
  .regex(/^[A-Za-z]+$/, "Only Letters");


/**
 * Username field definition for zod schema
 */
export const UsernameSchema = z
  .string()
  .min(1, "Required")
  .max(20, "Very Long, Maximum 20 Characters")
  .regex(/^[A-Za-z0-9 _-]+$/, "Invalid Symbols");

/**
 * Email field definition for zod schema
 */
export const EmailSchema = z
  .string()
  .min(1, "Required")
  .email("Invalid Email")
  .refine((val) => !/[<>`'"\\]/.test(val), {
    message: "Invalid Characters",
  });

/**
 * Date of birth field definition for zod schema
 */
export const DateOfBirthSchema = z
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
export const PasswordSchema = z
  .string()
  .min(6, "Minimum 6 Characters Long")
  .max(25, "Maximum 25 Characters Long")
  .regex(/^[a-zA-Z0-9 _-]+$/, "Invalid Symbols");

/**
 * Confirm password field definition for zod schema
 */
export const ConfirmPasswordSchema = z
  .string()
  .min(6, "Minimum 6 Characters Long")
  .max(25, "Maximum 25 Characters Long")
  .regex(/^[a-zA-Z0-9 _-]+$/, "Invalid Symbols");