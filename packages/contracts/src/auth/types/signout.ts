import z from "zod";
import { SignoutSchema } from "../schema/signout";

export type SignoutType = z.infer<typeof SignoutSchema>;
