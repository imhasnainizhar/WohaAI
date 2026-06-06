import z from "zod";
import { 
    SignupInitRequestSchema, 
    ContinueWithUsernameRequestSchema, 
    ContinueWithEmailRequestSchema, 
    VerifyUserEmailRequestSchema, 
    SignupCompleteRequestSchema, 
    PersonalInfoValidationRequestSchema, 
    PasswordValidationRequestSchema 
} from "../schema";
import { DateOfBirth, Email, FirstName, LastName, Username, UsernameOrEmail } from "./fields";

export type SignupInitRequest = z.infer<typeof SignupInitRequestSchema>;
export type ContinueWithUsernameRequest = z.infer<typeof ContinueWithUsernameRequestSchema>;
export type ContinueWithEmailRequest = z.infer<typeof ContinueWithEmailRequestSchema>;
export type VerifyUserEmailRequest = z.infer<typeof VerifyUserEmailRequestSchema>;
export type SignupCompleteRequest = z.infer<typeof SignupCompleteRequestSchema>

export type PersonalInfoValidationRequest  = z.infer<typeof PersonalInfoValidationRequestSchema>
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
    personalInfoValidated: boolean
}

export interface PasswordValidationResponse {
    passwordValidated: boolean
}

export type SignupFormCache = {
    firstName: FirstName,
    lastName: LastName,
    email: Email,
    dateOfBirth: DateOfBirth,
    username: Username,
}