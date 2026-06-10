import z from "zod";
import { SigninRequestSchema } from "../schema/signin";

export type SigninRequest = z.infer<typeof SigninRequestSchema>;

export interface SigninResponse {
    profilePicURI: string;
    userID: string;
    username: string;
    firstName: string;
    lastName: string;
    email: string;
}