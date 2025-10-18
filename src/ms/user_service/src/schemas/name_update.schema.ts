import { z } from "zod";

export const NameUpdateSchema = z
  .object({
    userID: z.number(),
    firstName: z
      .string()
      .min(1, "*Required")
      .max(20, "Very Long, Maximum 20 Characters")
      .regex(/^[A-Za-z]+$/, "Only Letters"),

    lastName: z
      .string()
      .min(1, "*Required")
      .max(20, "Very Long, Maximum 20 Characters")
      .regex(/^[A-Za-z]+$/, "Only Letters"),
  });
export type NameUpdateSchema = z.infer<typeof NameUpdateSchema>;
