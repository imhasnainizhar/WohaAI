import { env } from "@config/env.config";
import { Runnable } from "@langchain/core/runnables";
import { ChatOpenAI } from "@langchain/openai";
import { getMCPTools } from "@tools/externals/MCPTools";
import { logger } from "@utils/logger";
import { PlannerDecision, PlannerDecisionSchema } from "@internals/schemas/planner.schema";

let cachedLLM: Runnable | null = null;

export async function plannerModel(): Promise<Runnable>{
    if(cachedLLM) return cachedLLM;

    // const MCPTools = await getMCPTools();
    // if (!MCPTools.length) throw new Error("No MCP tools available, Failed to load Tools.");
    // logger.debug("MCP Tools Loaded")

    cachedLLM = new ChatOpenAI({
        model: "gpt-4o-2024-08-06",
        temperature: 0,
        maxRetries: 2,
        maxTokens: 4000,
        apiKey: env.OPENAI_API_KEY
    }).withStructuredOutput<PlannerDecision>(PlannerDecisionSchema);

    return cachedLLM;
}