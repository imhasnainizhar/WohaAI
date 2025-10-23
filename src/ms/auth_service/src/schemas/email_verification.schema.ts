import z from "zod";

export const verifyUserEmailSchema = z
  .object({
    email: z
      .string()
      .email("Invalid email format.")
      .refine((val) => !/[<>`'"\\]/.test(val), {
        message: "Invalid Characters for email",
      }),
    verificationCode: z
      .string()
      .min(1, "Verification code required")
      .length(6, "Verification code must be 6 digits")
      .regex(/^\d+$/, "Verification code must be numeric"),
  })

export type verifyUserEmail = z.infer<typeof verifyUserEmailSchema>;