import z from "zod";
import { FirstName, LastName, DateOfBirth, Password } from "../../../objects/auth/user";

export const CompleteSignupSchema = z.object({
    firstName: FirstName,
    lastName: LastName,
    dateOfBirth: DateOfBirth,
    password: Password,
    confirmPassword: Password,
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
})

export type CompleteSignupType = z.infer<typeof CompleteSignupSchema>