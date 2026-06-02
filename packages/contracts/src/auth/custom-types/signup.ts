import z from "zod";
import { SignupInitRequestSchema, ContinueWithUsernameRequestSchema, ContinueWithEmailRequestSchema, VerifyUserEmailRequestSchema, SignupCompleteRequestSchema, NameValidationRequestSchema, PasswordValidationRequestSchema } from "../schema";

export type SignupInitRequest = z.infer<typeof SignupInitRequestSchema>;
export type ContinueWithUsernameRequest = z.infer<typeof ContinueWithUsernameRequestSchema>;
export type ContinueWithEmailRequest = z.infer<typeof ContinueWithEmailRequestSchema>;
export type VerifyUserEmailRequest = z.infer<typeof VerifyUserEmailRequestSchema>;
export type SignupCompleteRequest = z.infer<typeof SignupCompleteRequestSchema>

export type NameValidationRequest  = z.infer<typeof NameValidationRequestSchema>
export type PasswordValidationRequest = z.infer<typeof PasswordValidationRequestSchema>

export interface SignupInitResponse {
    signupSessionInit: boolean
    alreadyExists: boolean;
}

export interface ContinueWithUsernameResponse {
    usernameValidated: boolean
}

export interface ContinueWithEmailResponse {
    emailValidated: boolean
}

export interface SendVerificationEmailResponse {
    verificationEmailSent: boolean
}

export interface VerifyUserEmailResponse {
    emailVerified: boolean
}

export interface NameValidationResponse {
    nameValidated: boolean
}

export interface PasswordValidationResponse {
    passwordValidated: boolean
}