import z from "zod";
import { CreatedUserResponseSchema } from "../schema/user-creation-response";

export type CreatedUserResponse = z.infer<typeof CreatedUserResponseSchema>