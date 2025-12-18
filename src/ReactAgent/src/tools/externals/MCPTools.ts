import { MultiServerMCPClient } from "@langchain/mcp-adapters";
import { logger } from "@utils/logger.js";
import { env } from "@config/env.config.js";

// Create MCP client
const MCPClient = new MultiServerMCPClient({
    mcp_gateway: {
        transport: "http",
        url: `http://mcp_gateway:${env.MCP_GATEWAY_PORT}/mcp`
    }
});

// Async function to get callable MCP tools
export async function getMCPTools() {
    try {
        return await MCPClient.getTools(); // returns callable tools
    } catch (err) {
        console.error("Failed to fetch MCP tools:", err);
        return [];
    }
}