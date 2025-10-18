import { z } from "zod";

export const emailUpdateSchema = z
  .object({
    email: z
      .string()
      .trim()
      .email("Invalid email format.")
      .refine((val) => !/[<>`'"\\]/.test(val), {
        message: "Invalid Characters",
      }),
    userID: z.number(),
  });
export type EmailUpdate = z.infer<typeof emailUpdateSchema>;
