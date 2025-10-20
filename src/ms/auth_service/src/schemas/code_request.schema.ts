import z from "zod";

const verificationCodeRequestSchema = z
.object({
    email: z
    .string()
      .email("Invalid email format.")
      .refine((val) => !/[<>`'"\\]/.test(val), {
        message: "Invalid Characters for email",
      }),
})