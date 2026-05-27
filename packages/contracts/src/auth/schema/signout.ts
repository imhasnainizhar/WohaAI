import z from "zod";
import { UserIDSchema } from "./session";


export const SignoutRequestSchema = z.object({
    userID: UserIDSchema,
});
