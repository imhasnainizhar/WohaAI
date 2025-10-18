import { z } from "zod"

export const PasswordUpdateSchema = z
  .object({
    userID: z.number(),
    newPassword: z
      .string()
      .min(1, "*Required")
      .min(6, "Invalid Password")
      .max(25, "Maximum 25 Characters Long")
      .regex(/^[a-zA-Z0-9 _-]+$/, "Invalid Symbols"),
    confirmNewPassword: z
      .string()
      .min(1, "*Required")
      .max(25, "Maximum 25 Characters Long")
      .regex(/^[a-zA-Z0-9 @$£&_-]+$/, "Invalid Symbols"),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    path: ["confirmPassword"],
    message: "Passwords Do Not Match",
  });
export type PasswordUpdateSchema = z.infer<typeof PasswordUpdateSchema>;
