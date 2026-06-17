import z from "zod";
import { SigninInitRequestSchema, SigninCompleteRequestSchema } from "../schema/signin";

export type SigninInitRequest = z.infer<typeof SigninInitRequestSchema>;
export type SigninCompleteRequest = z.infer<typeof SigninCompleteRequestSchema>;

export interface SigninCompleteResponse {
    profilePicURI: string
    userID: string
    username: string
    fullName: string
    email: string
}