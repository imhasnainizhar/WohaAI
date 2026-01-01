import z from "zod";
import { UserID } from "../../../objects/auth/common/session";

export const SignoutSchema = z.object({
    userID: UserID,
});