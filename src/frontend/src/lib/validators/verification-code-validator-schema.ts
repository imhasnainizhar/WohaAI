import { z } from "zod";

export const VerificationCodeSchema = z.object({
    verificationCode: z
    .string()
    .min(1, "Enter Code From Mail Box")
    .regex(/^\d{6}$/, "Invalid Code"),
});

export const VerificationRequestSchema = z.object({
    email: z.string().email(),
    verificationCode: z
    .string()
    .min(1, "Enter Code From Mail Box")
    .regex(/^\d{6}$/, "Invalid Code"),
})
  