import z from "zod";
import { SignoutSchema } from "./schemas";

export type SignoutType = z.infer<typeof SignoutSchema>;
