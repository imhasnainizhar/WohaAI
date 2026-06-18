import { z } from "zod";

/**
 * First name field definition for zod schema
 */
export const FullNameSchema = z
  .string()
  .min(1, "Required")
  .max(30, "Very Long, Maximum 30 Characters")
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
  .email({ message: "Invalid Email" });

/**
 * Date of birth field definition for zod schema
 */
export const DateOfBirthSchema = z
  .date()
  .refine((dob) => {
    const today = new Date();

    const minAgeDate = new Date(
      today.getFullYear() - 14,
      today.getMonth(),
      today.getDate()
    );

    return dob <= minAgeDate;
  }, {
    message: "Must be at least 14 years old",
  });
  
/**
 * Password field definition for zod schema
 */
export const PasswordSchema = z
  .string()
  .min(6, "Minimum 6 Characters Long")
  .max(25, "Maximum 25 Characters Long")
  .regex(/^[a-zA-Z0-9 _-]+$/, "Invalid Symbols");


// VERIFICATION CODE
export const VerificationCodeSchema = z
  .string()
  .trim()
  .length(6, {
    message: "Verification code must be 6 digits",
  })
  .regex(/^\d+$/, {
    message: "Verification code must contain only numbers",
  });

export const SessionIDSchema =
  z.uuid();


export const UsernameOrEmailSchema = z
  .string()
  .min(5, "Minimum 5 Characters")
  .max(40, "Maximum 40 Characters")
  .transform((val, ctx) => {
    if (EmailSchema.safeParse(val)) {
      return { type: "email" as const, value: val };
    }
    if (UsernameSchema.safeParse(val)) {
      return { type: "username" as const, value: val };
    }

    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Must be a valid username or email",
    });

    return z.NEVER;
  })

export type TFullName = z.infer<typeof FullNameSchema>;
export type TUsername = z.infer<typeof UsernameSchema>;
export type TEmail = z.infer<typeof EmailSchema>;
export type TDateOfBirth = z.infer<typeof DateOfBirthSchema>;
export type TPassword = z.infer<typeof PasswordSchema>;
export type TVerificationCode = z.infer<typeof VerificationCodeSchema>;
export type TSessionID = z.infer<typeof SessionIDSchema>;
export type TUsernameOrEmail = z.infer<typeof UsernameOrEmailSchema>;