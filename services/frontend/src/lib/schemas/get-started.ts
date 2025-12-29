import { z } from "zod";

// Step 1: Either username or email
export const GetStartedSchema = z.object({
    usernameOrEmail: z
        .string()
        .min(1, "Required")
        .refine(val => {
            // Check if val is either a valid username or email
            return /^[\w]{3,}$/.test(val) || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
        }, { message: "Must be a valid username or email" }),
});

export type GetStartedType = z.infer<typeof GetStartedSchema>;
