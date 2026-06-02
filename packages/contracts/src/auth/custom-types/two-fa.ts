import z from "zod";
import { TotpCodeSchema, TwoFARequestSchema } from "../schema/two-fa";

export type TotpCode = z.infer<typeof TotpCodeSchema>;
export type TwoFARequest = z.infer<typeof TwoFARequestSchema>