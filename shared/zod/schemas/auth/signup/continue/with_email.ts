import { Email } from "../../../../objects/auth/user";
import { z } from "zod";

/**
 * Used for continueWithEmail service for email validation at second step after get started step.
 * If user initializes with username so second step require email.
 */
export const EmailSignupSchema = z.object({
    email: Email,
});

export type EmailSignupType = z.infer<typeof EmailSignupSchema>;