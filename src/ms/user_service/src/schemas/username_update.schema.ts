import { z } from "zod";

export const usernameUpdateSchema = z
  .object({
    userID: z.number(),
    username: z
      .string()
      .trim()
      .min(3, "Username must be at least 3 characters.")
      .max(30, "Username must be at most 30 characters.")
      .regex(/^[a-zA-Z0-9._-]+$/, "Username Contains Invalid Characters"),
  });
export type UsernameUpdate = z.infer<typeof usernameUpdateSchema>;