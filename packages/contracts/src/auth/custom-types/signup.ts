import z from "zod";
import { GetStartedRequestSchema, CompleteSignupRequestSchema, UsernameSignupRequestSchema, EmailSignupRequestSchema, VerifyUserEmailRequestSchema, VerificationCodeSchema, SendVerificationEmailRequestSchema } from "../schema";

export type GetStartedRequest = z.infer<typeof GetStartedRequestSchema>;
export type CompleteSignupRequest = z.infer<typeof CompleteSignupRequestSchema>
export type UsernameSignupRequest = z.infer<typeof UsernameSignupRequestSchema>;
export type EmailSignupRequest = z.infer<typeof EmailSignupRequestSchema>;
export type VerificationCode = z.infer<typeof VerificationCodeSchema>;
export type SendVerificationEmailRequest = z.infer<typeof SendVerificationEmailRequestSchema>;
export type VerifyUserEmailRequest = z.infer<typeof VerifyUserEmailRequestSchema>;

export type GetStartedResponse = {
    identifierType: "username" | "email";
    identifier: string;
    already_exists: boolean;
};

export type VerifySignupEmailEvent = {
    type: string,
    email: string,
    code: string,
    signupSessionID: string,
    createdAt: Date
}

export type VerifySigninEmailEvent = {
    type: string,
    email: string,
    code: string,
    signinSessionID: string,
    createdAt: Date
}