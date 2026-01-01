import z from "zod";
import { Email, FirstName, LastName } from "@zod/objects/auth/user";
import { VerificationCode } from "../../../../objects/auth/verification";
import { SignupSessionID } from "../../../../objects/auth/common/objects";

export const verifyUserEmailSchema = z
  .object({
    signupSessionID: SignupSessionID,
    email: Email,
    verificationCode: VerificationCode,
  })

export type verifyUserEmail = z.infer<typeof verifyUserEmailSchema>;

export const sendVerificationEmailSchema = z
  .object({
    signupSessionID: SignupSessionID,
    email: Email,
    firstName: FirstName,
    lastName: LastName,
    verificationCode: VerificationCode,
  })

export type sendVerificationEmail = z.infer<typeof sendVerificationEmailSchema>;