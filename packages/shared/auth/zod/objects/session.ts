import z from "zod";

export const SignupSessionID = z.string().min(1, "Required");
export const UserSessionID = z.string().min(1, "Required");
export const UserIPAddress = z.string().min(1, "Required");
export const UserID = z.string().min(1, "Required");
