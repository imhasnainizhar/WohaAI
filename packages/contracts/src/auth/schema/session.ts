import z from "zod";

export const SignupSessionIDSchema = z.string().min(1, "Required");
export const SigninSessionIDSchema = z.string().min(1, "Required");
export const UserSessionIDSchema = z.string().min(1, "Required");
export const UserIPAddressSchema = z.string().min(1, "Required");
export const UserIDSchema = z.string().min(1, "Required");