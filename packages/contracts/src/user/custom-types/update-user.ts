import z from "zod";
import { 
    UpdateUsernameRequestSchema, 
    UpdateFullNameRequestSchema, 
    UpdateDOBRequestSchema, 
    UpdateProfilePicRequestSchema 
} from "../schemas/update-user";

export type UpdateUsernameRequest = z.infer<typeof UpdateUsernameRequestSchema>
export type UpdateFullNameRequest = z.infer<typeof UpdateFullNameRequestSchema>
export type UpdateDOBRequest = z.infer<typeof UpdateDOBRequestSchema>
export type UpdateProfilePicRequest = z.infer<typeof UpdateProfilePicRequestSchema>