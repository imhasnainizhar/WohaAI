import z from "zod";
import { CreatedUserResponseSchema } from "../schema/user-creation-response";


/**
 * @AuthService Re-validates user data before provisioning at UserProvisionClient
 * @UserService Re-validates user data before provisioning at User API for security.
 */
export type CreatedUserResponse = z.infer<typeof CreatedUserResponseSchema>