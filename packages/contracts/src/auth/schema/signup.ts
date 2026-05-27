import z from "zod";
import { SignupSessionIDSchema } from "./session";
import { ConfirmPasswordSchema, DateOfBirthSchema, EmailSchema, FirstNameSchema, LastNameSchema, PasswordSchema, UsernameSchema } from "./user";
import { authRegex } from "@/utils/auth-regex";

export const GetStartedRequestSchema = z.object({
    usernameOrEmail: z
        .string()
        .min(1, "Required")
        .transform((val, ctx) => {
            if (authRegex.emailRegex.test(val)) {
                return { type: "email" as const, value: val };
            }
            if (authRegex.usernameRegex.test(val)) {
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
export const UsernameSignupRequestSchema = z.object({
    username: UsernameSchema,
});

/**
 * Used for continueWithEmail service for email validation at second step after get started step.
 * If user initializes with username so second step require email.
 */
export const EmailSignupRequestSchema = z.object({
    email: EmailSchema,
});

export const CompleteSignupRequestSchema = z.object({
    firstName: FirstNameSchema,
    lastName: LastNameSchema,
    dateOfBirth: DateOfBirthSchema,
    password: PasswordSchema,
    confirmPassword: ConfirmPasswordSchema,
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
})

export const VerificationCodeSchema = z.string().min(1, "Required").length(6, "Verification code must be 6 digits").regex(/^\d+$/, "Verification code must be numeric");

export const VerifyUserEmailRequestSchema = z
    .object({
        signupSessionID: SignupSessionIDSchema,
        email: EmailSchema,
        verificationCode: VerificationCodeSchema,
    })


export const SendVerificationEmailRequestSchema = z
    .object({
        signupSessionID: SignupSessionIDSchema,
        email: EmailSchema,
        firstName: FirstNameSchema,
        lastName: LastNameSchema,
        verificationCode: VerificationCodeSchema,
    })