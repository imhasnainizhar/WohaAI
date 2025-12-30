// fields.ts
import { z } from "zod";

// --- Basic fields ---

export const FirstName = z
  .string()
  .min(1, "Required")
  .max(20, "Very Long, Maximum 20 Characters")
  .regex(/^[A-Za-z]+$/, "Only Letters");

export const LastName = FirstName; // same rules

export const Username = z
  .string()
  .min(1, "Required")
  .max(20, "Very Long, Maximum 20 Characters")
  .regex(/^[A-Za-z0-9 _-]+$/, "Invalid Symbols");

export const Email = z
  .string()
  .min(1, "Required")
  .email("Invalid Email")
  .refine((val) => !/[<>`'"\\]/.test(val), {
    message: "Invalid Characters",
  });

export const DateOfBirth = z.date().refine((dob) => {
  const today = new Date();
  const minAge = new Date(
    today.getFullYear() - 14,
    today.getMonth(),
    today.getDate()
  );
  return dob <= minAge;
}, "Must be at least 14 years old");

export const Password = z
  .string()
  .min(1, "Required")
  .min(6, "Invalid Password")
  .max(25, "Maximum 25 Characters Long")
  .regex(/^[a-zA-Z0-9 _-]+$/, "Invalid Symbols");
