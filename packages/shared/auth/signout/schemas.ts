import z from "zod";
import { UserID } from "../zod/objects/session";

export const SignoutSchema = z.object({
    userID: UserID,
});
