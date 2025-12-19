import { MultiServerMCPClient } from "@langchain/mcp-adapters";
import { logger } from "@utils/logger.js";
import { env } from "@config/env.config.js";

// Lazy initialization - client is created only when needed
let MCPClient: MultiServerMCPClient | null = null;

function getMCPClient(): MultiServerMCPClient {
    if (!MCPClient) {
        MCPClient = new MultiServerMCPClient({
            mcp_gateway: {
                transport: "http",
                url: `http://mcp_gateway:${env.MCP_GATEWAY_PORT}/mcp`
            }
        });
        logger.debug(`MCP client initialized for gateway at http://mcp_gateway:${env.MCP_GATEWAY_PORT}/mcp`);
    }
    return MCPClient;
}

// Retry helper function
async function retryWithBackoff<T>(
    fn: () => Promise<T>,
    maxRetries: number = 3,
    initialDelay: number = 1000
): Promise<T> {
    let lastError: Error;
    
    for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error as Error;
            if (attempt < maxRetries - 1) {
                const delay = initialDelay * Math.pow(2, attempt);
                logger.warn(
                    `MCP connection attempt ${attempt + 1} failed, retrying in ${delay}ms... Error: ${lastError.message}`
                );
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    }
    
    throw lastError!;
}

// Async function to get callable MCP tools
export async function getMCPTools() {
    try {
        const client = getMCPClient();
        return await retryWithBackoff(
            () => client.getTools(),
            3,
            1000
        );
    } catch (err) {
        logger.error("Failed to fetch MCP tools after retries: " + (err as Error).message);
        return [];
    }
}