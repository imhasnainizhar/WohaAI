import { DateOfBirthSchema } from "@/auth";
import { z } from "zod";

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