import z from "zod";
import { authRegex } from "./auth-regex";
import { UsernameOrEmailSchema, PasswordSchema, UsernameSchema, EmailSchema, VerificationCodeSchema } from "./fields.schemas";

// --------- Schemas for Signin Requests ----------------

export const SigninInitRequestSchema = z.object({
    usernameOrEmail: UsernameOrEmailSchema,
});

export const SigninCompleteRequestSchema = z.object({
    password: PasswordSchema,
});


// --------- Schemas for Multi-Step Signup Requests ----------------

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


// ------------ Two-Factor Authentication Schemas ------------

export const TotpCodeSchema = z
    .string()
    .trim()
    .regex(/^\d{6}$/, "Invalid TOTP code");

export const TwoFARequestSchema = z.object({
    totp: TotpCodeSchema
})


// ------------ Change Email Requests Schemas --------------

export const ChangeEmailRequestSchema = z.object({
    newEmail: EmailSchema
})

export const VerifyEmailChangeRequestSchema = z.object({
    verificationCode: VerificationCodeSchema
})


// ------------ Change Password Requests Schemas --------------

export const ChangePasswordInitRequestSchema = z.object({
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

export const ChangePasswordRequestSchema = z.object({
    newPassword: PasswordSchema,
    newConfirmPassword: PasswordSchema
}).refine(
    ({ newPassword, newConfirmPassword }) =>
        newPassword === newConfirmPassword,
    {
        message: "Passwords do not match",
        path: ["newConfirmPassword"],
    }
);


// ----------- Infered Types ----------------

export type TContinueWithUsernameRequest = z.infer<typeof ContinueWithUsernameRequestSchema>;
export type TContinueWithEmailRequest = z.infer<typeof ContinueWithEmailRequestSchema>;
export type TVerifyUserEmailRequest = z.infer<typeof VerifyUserEmailRequestSchema>;
export type TPasswordValidationRequest = z.infer<typeof PasswordValidationRequestSchema>;
export type TTotpCode = z.infer<typeof TotpCodeSchema>;
export type TTwoFARequest = z.infer<typeof TwoFARequestSchema>;
export type TChangeEmailRequest = z.infer<typeof ChangeEmailRequestSchema>;
export type TVerifyEmailChangeRequest = z.infer<typeof VerifyEmailChangeRequestSchema>;
export type TChangePasswordInitRequest = z.infer<typeof ChangePasswordInitRequestSchema>;
export type TChangePasswordRequest = z.infer<typeof ChangePasswordRequestSchema>;