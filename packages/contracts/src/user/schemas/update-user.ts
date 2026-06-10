import { z } from "zod";

export const UpdateUserSchema = z.object({
    id: z.string().uuid(),

    firstName: z
        .string()
        .min(1)
        .max(50)
        .optional(),

    lastName: z
        .string()
        .min(1)
        .max(50)
        .optional(),

    username: z
        .string()
        .min(3)
        .max(30)
        .regex(/^[a-zA-Z0-9_]+$/)
        .optional(),

    dateOfBirth: z
        .string()
        .datetime()
        .optional()
        .nullable()
        .transform((val) => (val ? new Date(val) : null))
});