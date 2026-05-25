import z from "zod"
import { SignupSessionIDSchema, UserSessionIDSchema, UserIPAddressSchema, UserIDSchema } from "../schema/session"

export type SignupSessionID = z.infer<typeof SignupSessionIDSchema>
export type SigninSessionID = z.infer<typeof SignupSessionIDSchema>
export type UserSessionID = z.infer<typeof UserSessionIDSchema>
export type UserIPAddress = z.infer<typeof UserIPAddressSchema>
export type UserID = z.infer<typeof UserIDSchema>