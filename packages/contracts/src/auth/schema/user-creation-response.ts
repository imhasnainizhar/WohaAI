import z from "zod";
import { DateOfBirthSchema, EmailSchema, UsernameSchema, FullNameSchema } from "../../user/schemas/fields";

export const CreatedUserResponseSchema = z.object({
    success: z.boolean(),
    userData: z.object({
        userID: z.string(),
        username: UsernameSchema,
        email: EmailSchema,
        fullName: FullNameSchema,
        dateOfBirth: DateOfBirthSchema,
    }),
});