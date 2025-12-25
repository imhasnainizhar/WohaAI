import { z } from "zod";

// This schema is used for api-level endorsement on llm to provide
// structured output for memory related decisions.
export const MemorySchema = z.object({
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

export type MemorySchemaType = z.infer<typeof MemorySchema>;
