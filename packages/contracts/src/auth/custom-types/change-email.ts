import z from "zod";
import { EmailChangeRequestSchema, VerifyEmailChangeRequestSchema } from "../schema/change-email";

export type EmailChangeRequest = z.infer<typeof EmailChangeRequestSchema>
export type VerifyEmailChangeRequest = z.infer<typeof VerifyEmailChangeRequestSchema>