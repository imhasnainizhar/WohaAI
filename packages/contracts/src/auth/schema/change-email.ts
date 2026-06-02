import z from "zod";
import { EmailSchema, VerificationCodeSchema } from "./fields";


export const EmailChangeRequestSchema = z.object({
    newEmail: EmailSchema
})

export const VerifyEmailChangeRequestSchema = z.object({
    verificationCode: VerificationCodeSchema
})