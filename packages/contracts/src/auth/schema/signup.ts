import z from "zod";
import { ConfirmPasswordSchema, DateOfBirthSchema, EmailSchema, FirstNameSchema, LastNameSchema, PasswordSchema, UsernameOrEmailSchema, UsernameSchema, VerificationCodeSchema } from "./fields";

export const SignupInitRequestSchema = z.object({
    usernameOrEmail: UsernameOrEmailSchema
});

/**
 * Used for continueWithUsername service for username validation at second step after get started step.
 * If user initializes with email so second step require username.
 */
export const ContinueWithUsernameRequestSchema = z.object({
    username: UsernameSchema,
});

/**
 * Used for continueWithEmail service for email validation at second step after get started step.
 * If user initializes with username so second step require email.
 */
export const ContinueWithEmailRequestSchema = z.object({
    email: EmailSchema,
});

// VERIFY USER EMAIL REQUEST
export const VerifyUserEmailRequestSchema = z.object({
    verificationCode: VerificationCodeSchema,
});

export const PersonalInfoValidationRequestSchema = z.object({
    firstName: FirstNameSchema,
    lastName: LastNameSchema,
    dateOfBirth: DateOfBirthSchema
})

/**
 * Object validation schema
 */
export const PasswordValidationRequestSchema = z
    .object({
        password: PasswordSchema,
        confirmPassword: ConfirmPasswordSchema,
    })
    .refine(
        ({ password, confirmPassword }) =>
            password === confirmPassword,
        {
            message: "Passwords do not match",
            path: ["confirmPassword"],
        }
    );