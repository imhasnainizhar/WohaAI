import { ZodError } from "zod";

export const sanitizedFieldErrors = (error: ZodError) => {
    const entries = Object.entries(error.flatten().fieldErrors) as [string, string[]][];

    const filtered = entries.filter((entry) => {
        const v = entry[1];
        Array.isArray(v) && v.length > 0
    })

    return Object.fromEntries(filtered);
}