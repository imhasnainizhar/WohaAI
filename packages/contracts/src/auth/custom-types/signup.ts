import z from "zod";
import { SignupInitRequestSchema, ContinueWithUsernameRequestSchema, ContinueWithEmailRequestSchema, VerifyUserEmailRequestSchema, VerificationCodeSchema, SignupCompleteRequestSchema } from "../schema";

export type SignupInitRequest = z.infer<typeof SignupInitRequestSchema>;
export type UsernameSignupRequest = z.infer<typeof ContinueWithUsernameRequestSchema>;
export type EmailSignupRequest = z.infer<typeof ContinueWithEmailRequestSchema>;
export type VerificationCode = z.infer<typeof VerificationCodeSchema>;
export type VerifyUserEmailRequest = z.infer<typeof VerifyUserEmailRequestSchema>;
export type SignupCompleteRequest = z.infer<typeof SignupCompleteRequestSchema>

export interface VerifySignupEmailEvent {
    type: string,
    email: string,
    code: string,
    signupSessionID: string,
    createdAt: Date
}

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