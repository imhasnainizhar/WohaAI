import z from "zod";
import { EmailSchema, PasswordSchema, UsernameSchema, VerificationCodeSchema } from "../../user/schemas/fields";


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

/**
 * Object validation schema
 */
export const PasswordValidationRequestSchema = z
    .object({
        password: PasswordSchema,
        confirmPassword: PasswordSchema,
    })
    .refine(
        ({ password, confirmPassword }) =>
            password === confirmPassword,
        {
            message: "Passwords do not match",
            path: ["confirmPassword"],
        }
    );