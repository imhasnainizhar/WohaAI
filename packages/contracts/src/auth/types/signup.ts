import z from "zod";
import { GetStartedSchema, CompleteSignupSchema, UsernameSignupSchema, EmailSignupSchema, SendVerificationEmailSchema, VerificationCodeSchema, VerifyUserEmailSchema } from "../schema/signup";

export type GetStarted = z.infer<typeof GetStartedSchema>;
export type CompleteSignup = z.infer<typeof CompleteSignupSchema>
export type UsernameSignup = z.infer<typeof UsernameSignupSchema>;
export type EmailSignup = z.infer<typeof EmailSignupSchema>;
export type VerificationCode = z.infer<typeof VerificationCodeSchema>;
export type VerificationEmail = z.infer<typeof SendVerificationEmailSchema>;
export type VerifyUserEmail = z.infer<typeof VerifyUserEmailSchema>;

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