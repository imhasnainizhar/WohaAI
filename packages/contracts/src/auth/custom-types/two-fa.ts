import z from "zod";
import { TotpCodeSchema } from "../schema/two-fa";

export type TotpCode = z.infer<typeof TotpCodeSchema>;