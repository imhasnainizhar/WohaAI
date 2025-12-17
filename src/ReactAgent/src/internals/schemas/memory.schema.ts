// memoryDecision.schema.ts
import { z } from "zod";

export const memoryDecisionSchema = z.object({
  shouldStore: z.boolean(),
  quadrant: z.enum([
    "FACTS",
    "PREFERENCES",
    "PROJECTS",
    "EPISODIC",
  ]).nullable(),

  memory: z.string().nullable(),
  reason: z.string().nullable(),
});

export type MemoryDecision = z.infer<typeof memoryDecisionSchema>;