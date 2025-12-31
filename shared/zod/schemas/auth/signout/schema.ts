import z from "zod";
import { UserID } from "../../../objects/auth/common/objects";

export const SignoutSchema = z.object({
    userID: UserID,
});