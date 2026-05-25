import z from "zod";
import { UserIDSchema } from "./session";


export const SignoutSchema = z.object({
    userID: UserIDSchema,
});
