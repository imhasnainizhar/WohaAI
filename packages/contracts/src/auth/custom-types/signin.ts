import z from "zod";
import { SigninInitRequestSchema, SigninCompleteSchema } from "../schema/signin";

export type SigninInitRequest = z.infer<typeof SigninInitRequestSchema>;
export type SigninCompleteRequest = z.infer<typeof SigninCompleteSchema>;

export interface SigninCompleteResponse {
    profilePicURI: string
    userID: string
    username: string
    fullName: string
    email: string
}