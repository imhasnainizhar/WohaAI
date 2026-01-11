import z from "zod";
import { SigninSchema } from "./schemas";

export type SignInType = z.infer<typeof SigninSchema>;
