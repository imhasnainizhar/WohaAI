import { MultiServerMCPClient } from "@langchain/mcp-adapters";

// Create MCP client
const MCPClient = new MultiServerMCPClient({
    mcp_gateway: {
        transport: "http",
        url: "http://localhost:9080/mcp"
    }
});

// Async function to get callable MCP tools
export async function getMCPTools() {
    try {
        const tools = await MCPClient.getTools(); // returns callable tools
        return tools;
    } catch (err) {
        console.error("Failed to fetch MCP tools:", err);
        return [];
    }
}