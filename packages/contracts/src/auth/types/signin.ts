import z from "zod";
import { SigninSchema } from "../schema/signin";

export type SignInType = z.infer<typeof SigninSchema>;