import z from "zod";

export const getCodeRequestSchema = z
.object({
    email: z
    .string()
    .email("Invalid email format.")
    .refine((val) => !/[<>`'"\\]/.test(val), {
        message: "Invalid Characters for email",
      }),
    signupSessionID: z
    .string()
    .refine((val) => !/[<>`'"\\]/.test(val), {
      message: "Invalid Session Id, Server Error",
    }),
});

export type getCodeRequestSchema = z.infer<typeof getCodeRequestSchema>;