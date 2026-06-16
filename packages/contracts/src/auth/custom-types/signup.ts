import z from "zod";
import { 
    ContinueWithUsernameRequestSchema, 
    ContinueWithEmailRequestSchema, 
    VerifyUserEmailRequestSchema, 
    PasswordValidationRequestSchema 
} from "../schema";

export type ContinueWithUsernameRequest = z.infer<typeof ContinueWithUsernameRequestSchema>;
export type ContinueWithEmailRequest = z.infer<typeof ContinueWithEmailRequestSchema>;
export type VerifyUserEmailRequest = z.infer<typeof VerifyUserEmailRequestSchema>;
export type PasswordValidationRequest = z.infer<typeof PasswordValidationRequestSchema>