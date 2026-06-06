import z from "zod";
import { DateOfBirthSchema, EmailSchema, LastNameSchema, UsernameSchema, FirstNameSchema } from "./fields";

export const CreatedUserResponseSchema = z.object({
    success: z.boolean(),
    userID: z.string(),
    username: UsernameSchema,
    email: EmailSchema,
    profilePicURI: z.string().optional(),
    firstName: FirstNameSchema,
    lastName: LastNameSchema,
    dateOfBirth: DateOfBirthSchema,
});