import { z } from "zod";
import { EmailSchema, UsernameSchema } from "./fields";

export const CreateUserSchema = z.object({
    username: UsernameSchema,

    email: EmailSchema,

    // IMPORTANT:
    // We used hashedPassword field directly because auth service can only reqquest user creation on successful signup request through User Provision Client. AuthService directly sends hashedPassword.
    hashedPassword: z.string(),

});