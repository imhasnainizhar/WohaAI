import { z } from "zod";

const SearchArgs = z.object({
    query: z.string(),
    requiredResults: z.number().int().min(1),
}).strict();

const ScrapeItem = z.object({
    url: z.string().refine(
        (v) => {
            try { new URL(v); return true } catch { return false }
        },
        { message: "URL Refinement Failed" }
    ),
    WebScraperOptions: z.object({
        timeoutMS: z.number().int().positive(),
        maxRetries: z.number().int().min(0),
        renderJS: z.boolean(),
        partialSelector: z.string(),
    }).strict(),
}).strict();

const ScrapeArgs = z.array(ScrapeItem);

const ToolCallSchema = z.discriminatedUnion("name", [
    z.object({
        name: z.literal("search"),
        args: SearchArgs,
    }).strict(),

    z.object({
        name: z.literal("scrape"),
        args: ScrapeArgs,
    }).strict(),
]);

export const PlannerDecisionSchema = z.object({
    action: z.enum(["Tools", "Summarize", "Respond"]),
    reason: z.string().nullable(),
    tool_calls: z.array(ToolCallSchema).nullable(),
}).strict();

export type ToolCall = z.infer<typeof ToolCallSchema>;
export type PlannerDecision = z.infer<typeof PlannerDecisionSchema>;