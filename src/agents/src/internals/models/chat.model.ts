import { env } from "@config/env.config";
import { ChatOpenAI } from "@langchain/openai";
import { getMCPTools } from "@tools/externals/mcp_tools";

export async function openAiModelWithTools() {
    const MCPTools = await getMCPTools();
    if (!MCPTools.length) throw new Error("No MCP tools available, Failed to load Tools.");

    return new ChatOpenAI({
        model: "gpt-4o-mini",
        temperature: 0,
        maxTokens: undefined,
        timeout: undefined,
        maxRetries: 2,
        apiKey: env.OPENAI_API_KEY
    })
    .bindTools(MCPTools);
}
