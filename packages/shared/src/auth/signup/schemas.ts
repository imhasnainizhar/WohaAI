import z from "zod";
import { FirstName, LastName, DateOfBirth, Password, ConfirmPassword } from "../zod/objects/user";
import { Email } from "../zod/objects/user";
import { Username } from "../zod/objects/user";
import { signupRegex } from "../../regex/auth/signup";
import { VerificationCode } from "../zod/objects/verification";
import { SignupSessionID } from "../zod/objects/session";


export const GetStartedSchema = z.object({
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
});

/**
 * Used for continueWithUsername service for username validation at second step after get started step.
 * If user initializes with email so second step require username.
 */
export const UsernameSignupSchema = z.object({
    username: Username,
});

/**
 * Used for continueWithEmail service for email validation at second step after get started step.
 * If user initializes with username so second step require email.
 */
export const EmailSignupSchema = z.object({
    email: Email,
});

export const CompleteSignupSchema = z.object({
    firstName: FirstName,
    lastName: LastName,
    dateOfBirth: DateOfBirth,
    password: Password,
    confirmPassword: ConfirmPassword,
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
})

export const verifyUserEmailSchema = z
  .object({
    signupSessionID: SignupSessionID,
    email: Email,
    verificationCode: VerificationCode,
  })


export const sendVerificationEmailSchema = z
  .object({
    signupSessionID: SignupSessionID,
    email: Email,
    firstName: FirstName,
    lastName: LastName,
    verificationCode: VerificationCode,
  })

