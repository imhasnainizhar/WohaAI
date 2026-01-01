import { Username } from "../../../../objects/auth/user";
import { z } from "zod";

/**
 * Used for continueWithUsername service for username validation at second step after get started step.
 * If user initializes with email so second step require username.
 */
export const UsernameSignupSchema = z.object({
    username: Username,
});

export type UsernameSignupType = z.infer<typeof UsernameSignupSchema>;