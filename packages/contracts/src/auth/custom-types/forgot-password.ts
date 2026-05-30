import z from "zod";
import { 
    ChangeForgottenPasswordRequestSchema, 
    ForgotPasswordInitRequestSchema 
} from "../schema/forgot-password";

export type ForgotPasswordInitRequest = z.infer<typeof ForgotPasswordInitRequestSchema>
export type ChangeForgottenPasswordRequest = z.infer<typeof ChangeForgottenPasswordRequestSchema>