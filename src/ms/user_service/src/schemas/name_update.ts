import { z } from "zod";

export const nameUpdateSchema = z
  .object({
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
export type NameUpdate = z.infer<typeof nameUpdateSchema>;
