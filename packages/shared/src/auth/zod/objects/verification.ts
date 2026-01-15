import { z } from "zod";

export const VerificationCode = z.string().min(1, "Required").length(6, "Verification code must be 6 digits").regex(/^\d+$/, "Verification code must be numeric");

export type VerificationCode = z.infer<typeof VerificationCode>;