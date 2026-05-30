import { env } from "@/config/env.js";
import { Runnable } from "@langchain/core/runnables";
import { ChatOpenAI } from "@langchain/openai";
import { getMCPTools } from "@/tools/externals/mcp.js";
import { agentLogger as logger } from '@packages/observability';
import { PlannerDecision, PlannerDecisionSchema } from "../internals/schemas/planner.js";

let cachedLLM: Runnable | null = null;

export async function plannerModel(): Promise<Runnable> {
    if (cachedLLM) return cachedLLM;

    cachedLLM = new ChatOpenAI({
        model: "gpt-4o-2024-08-06",
        temperature: 0,
        maxRetries: 2,
        maxTokens: 4000,
        apiKey: env.OPENAI_API_KEY
    }).withStructuredOutput<PlannerDecision>(PlannerDecisionSchema);

    return cachedLLM;
}