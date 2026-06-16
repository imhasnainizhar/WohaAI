import z from "zod";
import {
    ChangePasswordRequestSchema,
    ChangePasswordInitRequestSchema
} from "../schema/change-password";

export type ChangePasswordInitRequest = z.infer<typeof ChangePasswordInitRequestSchema>
export type ChangePasswordRequest = z.infer<typeof ChangePasswordRequestSchema>