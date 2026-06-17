import z from "zod";
import { ChangeEmailRequestSchema, VerifyEmailChangeRequestSchema } from "../schema/change-email";

export type ChangeEmailRequest = z.infer<typeof ChangeEmailRequestSchema>
export type VerifyEmailChangeRequest = z.infer<typeof VerifyEmailChangeRequestSchema>