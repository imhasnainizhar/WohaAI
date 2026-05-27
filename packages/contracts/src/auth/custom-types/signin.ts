import z from "zod";
import { SigninRequestSchema } from "../schema/signin";

export type SignInRequest = z.infer<typeof SigninRequestSchema>;

export interface SigninResponse {
    profilePicURI: string;
    userID: string;
    firstName: string;
    lastName: string;
    email: string;
    refreshToken: string;
    accessToken: string;
}