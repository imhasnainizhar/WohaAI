import { createAgent, providerStrategy, summarizationMiddleware } from "langchain";
import { StateGraph, START, END, MemorySaver } from "@langchain/langgraph";
import { PostgresSaver } from "@langchain/langgraph-checkpoint-postgres";
import { env } from "@config/env.js";
import { getMCPTools } from "@tools/externals/mcp.js";
import { GraphState } from "../domain/types/agent.js";
import { responseSchema } from "../domain/schemas/agent.js";
import pg from "pg"

// Not used in main agent workflor currently
// Just staying here for future needs, maybe..

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