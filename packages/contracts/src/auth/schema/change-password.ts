import z from "zod";
import { PasswordSchema } from './fields';

export const ChangePasswordRequestSchema = z.object({
    oldPassword: PasswordSchema,
    newPassword: PasswordSchema,
    newConfirmPassword: PasswordSchema
}).refine(
    ({ newPassword, newConfirmPassword }) =>
        newPassword === newConfirmPassword,
    {
        message: "Passwords do not match",
        path: ["newConfirmPassword"],
    }
);
