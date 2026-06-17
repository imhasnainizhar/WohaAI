import z from "zod";
import { EmailSchema, VerificationCodeSchema } from "../../user/schemas/fields";


export const ChangeEmailRequestSchema = z.object({
    newEmail: EmailSchema
})

export const VerifyEmailChangeRequestSchema = z.object({
    verificationCode: VerificationCodeSchema
})