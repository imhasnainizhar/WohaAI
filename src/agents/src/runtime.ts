import { ChatOpenAI } from "@langchain/openai";
import { createAgent, providerStrategy, summarizationMiddleware } from "langchain";
import { StateGraph, START, END } from "@langchain/langgraph";
import { PostgresSaver } from "@langchain/langgraph-checkpoint-postgres";
import { env } from "@config/env.config";
import { getMCPTools } from "./tools/externals/mcp_tools";
import z from "zod";
import pg from "pg"

const DB_URI = env.AGENT_MEMORY_DB_URI

// Graph State Type used as param of agent
type GraphState = {
  sid: string;
  input: string;
  memory?: string;
  searchResult?: string;
  output?: string;
};

// JSON schema for summarization memory
const memorySchema = {
  type: "object",
  properties: { memory: { type: "string" } },
};

// Response Schema for LLM
const responseSchema = z.object({
  output: z.string().optional()
});

// Response format to pass as a param for createAgent()
const responseFormat = providerStrategy(responseSchema);


// Persisted Memory
const pool = new pg.Pool({
  connectionString: DB_URI
})

// Postgres Checkpointer
const checkpointer = new PostgresSaver(pool);

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
}