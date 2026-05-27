import z from "zod";
import { SignoutRequestSchema } from "../schema/signout";

export type SignoutRequest = z.infer<typeof SignoutRequestSchema>;

export interface SignoutResponse {
    signedOut: true;
}