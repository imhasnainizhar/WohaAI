import z from "zod";
import { SignInSchema } from "./schemas";

export type SigninSessionPayload = {
    signinSessionID: string;
};

export type SignInType = z.infer<typeof SignInSchema>;
