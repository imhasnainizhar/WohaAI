import z from "zod";
import { EmailChangeRequestSchema, VerifyEmailChangeRequestSchema } from "../schema/change-email";

export interface RequestEmailChangeResponse {
    verificationEmailSent: boolean
}

export interface VerifyEmailChangeResponse {
    emailChanged: boolean;
}

export type EmailChangeRequest = z.infer<typeof EmailChangeRequestSchema>
export type VerifyEmailChangeRequest = z.infer<typeof VerifyEmailChangeRequestSchema>