import z from "zod";
import { UsernameSchema, EmailSchema, FullNameSchema, DateOfBirthSchema } from "./fields.schemas";


// -------- Create User Schema --------

export const CreateUserRequestSchema = z.object({
    username: UsernameSchema,

    email: EmailSchema,

    // IMPORTANT:
    // We used hashedPassword field directly because auth service can only reqquest user creation on successful signup request through User Provision Client. AuthService directly sends hashedPassword.
    hashedPassword: z.string(),

});


// --------------- User Response Schemas ---------------

export const CreatedUserResponseSchema = z.object({
    success: z.boolean(),
    userData: z.object({
        userID: z.string(),
        username: UsernameSchema,
        email: EmailSchema
    }),
});


// -------- Update User Requests Schemas --------

export const UpdateUsernameRequestSchema = z.object({
    username: z.string().min(3).max(30).regex(/^[a-zA-Z0-9_]+$/)
})

export const UpdateFullNameRequestSchema = z.object({
    fullName: z.string().min(1).max(30)
})

export const UpdateDOBRequestSchema = z.object({
    dateOfBirth: DateOfBirthSchema
})

export const UpdateProfilePicRequestSchema = z.object({
    profilePicURI: z.string().url()
})


// ----------- Infered Types ----------------

export type TCreateUserRequest = z.infer<typeof CreateUserRequestSchema>;
export type TCreatedUserResponse = z.infer<typeof CreatedUserResponseSchema>;
export type TUpdateUsernameRequest = z.infer<typeof UpdateUsernameRequestSchema>;
export type TUpdateFullNameRequest = z.infer<typeof UpdateFullNameRequestSchema>;
export type TUpdateDOBRequest = z.infer<typeof UpdateDOBRequestSchema>;
export type TUpdateProfilePicRequest = z.infer<typeof UpdateProfilePicRequestSchema>;