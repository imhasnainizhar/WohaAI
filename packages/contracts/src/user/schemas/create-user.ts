import { z } from "zod";

export const CreateUserSchema = z.object({
    firstName: z
        .string()
        .min(1, "First name is required")
        .max(50),

    lastName: z
        .string()
        .min(1, "Last name is required")
        .max(50),

    username: z
        .string()
        .min(3)
        .max(30)
        .regex(/^[a-zA-Z0-9_]+$/, "Invalid username format"),

    email: z
        .string()
        .email("Invalid email format"),

    // IMPORTANT:
    // We used hashedPassword field directly because auth service can only reqquest user creation on successful signup request through User Provision Client. AuthService directly sends hashedPassword.
    hashedPassword: z
        .string()
        .min(8, "Password must be at least 8 characters"),

    dateOfBirth: z
        .string()
        .datetime()
        .optional()
        .nullable()
        .transform((val) => (val ? new Date(val) : null))
});