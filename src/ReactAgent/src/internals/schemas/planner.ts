import { z } from "zod";

export const SearchArgs = z.object({
  prompt: z.string(),
  requiredResults: z.number().int().min(1).max(10), // realistic limits
}).strict();

export const ScrapeItem = z.object({
  url: z.string().refine(
    (v) => {
      try { new URL(v); return true; } catch { return false; }
    },
    { message: "Invalid URL" }
  ),
  WebScraperOptions: z.object({
    timeoutMS: z.number().int().positive().max(30000),
    maxRetries: z.number().int().min(0).max(5),
    renderJS: z.boolean(),
    partialSelector: z.string().min(1).max(200),
  }).strict(),
}).strict();

export const ScrapeArgs = z.array(ScrapeItem);

export const ToolCallSchema = z.discriminatedUnion("name", [
  z.object({
    name: z.literal("WebSearcherTool"),
    args: SearchArgs,
  }).strict(),

  z.object({
    name: z.literal("WebScraperTool"),
    args: ScrapeArgs,
  }).strict(),
]);

export const PlannerDecisionSchema = z.object({
  action: z.enum(["Tools", "Summarize", "Respond"]),
  reason: z.string().nullable(),
  tool_calls: z.array(ToolCallSchema).default([]),
}).strict();

export type PlannerToolCall = z.infer<typeof ToolCallSchema>;
export type PlannerDecision = z.infer<typeof PlannerDecisionSchema>;
