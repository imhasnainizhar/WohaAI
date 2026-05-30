import { ChatOpenAI } from "@langchain/openai";
import { env } from "@/config/env.js";
import { Runnable } from "@langchain/core/runnables";
import { getMCPTools } from "@/tools/externals/mcp.js";

let cachedToolCallModel: Runnable | null = null;
const MCPTools = await getMCPTools();

export const toolCallModel = async (): Promise<Runnable> => {
    if (cachedToolCallModel) return cachedToolCallModel;
    cachedToolCallModel = new ChatOpenAI({
        model: "gpt-4o-mini",
        temperature: 0,
        maxTokens: 2000,
        maxRetries: 5,
        timeout: 20000,
        apiKey: env.OPENAI_API_KEY,
    }).bindTools(MCPTools);
    return cachedToolCallModel;
}