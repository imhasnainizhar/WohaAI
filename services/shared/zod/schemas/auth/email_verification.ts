import z from "zod";
import { Email } from "../../objects";
import { VerificationCode } from "../../objects";

export const verifyUserEmailSchema = z
  .object({
    email: Email,
    verificationCode: VerificationCode,
  })

export type verifyUserEmail = z.infer<typeof verifyUserEmailSchema>;