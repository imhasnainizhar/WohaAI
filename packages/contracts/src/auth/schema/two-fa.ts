import { z } from "zod";

export const TotpCodeSchema = z
    .string()
    .trim()
    .regex(/^\d{6}$/, "Invalid TOTP code");