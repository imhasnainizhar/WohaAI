import { ZodError } from "zod";

export const sanitizedFieldErrors = (error: ZodError) => Object.fromEntries(
    Object.entries(error.flatten().fieldErrors).filter(
        ([, v]) => v !== undefined && v.length > 0
    )
) as Record<string, string[]>;
