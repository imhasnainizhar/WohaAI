import z from "zod";

export const CreatedUserResponseSchema = z.object({
    success: z.boolean(),
    userID: z.string(),
    username: z.string(),
    email: z.string(),
    profilePicURI: z.string().optional(),
    firstName: z.string(),
    lastName: z.string(),
});