import z from "zod";
import { ConfirmPasswordSchema, DateOfBirthSchema, EmailSchema, FirstNameSchema, LastNameSchema, PasswordSchema, UsernameSchema, VerificationCodeSchema } from "./fields";
import { authRegex } from "../../auth-regex";

export const SignupInitRequestSchema = z.object({
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

export const NameValidationSchema = z.object({
    firsrName: FirstNameSchema,
    lastName: LastNameSchema
})

/**
 * Object validation schema
 */
export const PasswordValidationSchema = z
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

export const SignupCompleteRequestSchema = z.object({
    rememberMe: z
        .boolean()
})