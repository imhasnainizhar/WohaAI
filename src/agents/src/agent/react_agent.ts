import { createAgent, providerStrategy, summarizationMiddleware } from "langchain";
import { StateGraph, START, END, MemorySaver } from "@langchain/langgraph";
import { PostgresSaver } from "@langchain/langgraph-checkpoint-postgres";
import { env } from "@config/env.config";
import { getMCPTools } from "@tools/externals/mcp_tools";
import { GraphState } from "@internals/types/agent";
import { responseSchema } from "@internals/schemas/agent.schema";
import { memorySchema } from '@internals/schemas/agent.schema';
import pg from "pg"


// DB URI for Postgres Pool
const DB_URI = env.AGENT_MEMORY_DB_URI

// Response format to pass as a param for createAgent()
const responseFormat = providerStrategy(responseSchema);


// Persisted Memory
const pool = new pg.Pool({
  connectionString: DB_URI
})

// Postgres Memory Saver for LTM
const postgresSaver = new PostgresSaver(pool);

// Memory Saver for Short-Term Memory
export const checkpointer = new MemorySaver();

// Agent Node
export default async function AgentNode() {

  // This is to get MCP Tools metadata registered at MCP Gateway
  const MCPTools = await getMCPTools();

  // Agent
  const agent = createAgent<GraphState>({
    model: "gpt-4o",
    tools: [...MCPTools],
    responseFormat,
    middleware: [
      summarizationMiddleware({
        model: "gpt-4o-mini",
        trigger: { tokens: 4000 },
        keep: { messages: 20 },
      }),
    ],
    checkpointer,
  });

  return agent;
}