import { Server } from "@modelcontextprotocol/sdk/server";
import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { logger } from "@utils/logger";
import { ServiceException } from "@utils/response";

class MCPGatewayServer {
    private mcp: Server;
    private tools: Tool[];
    private transport: StreamableHTTPServerTransport;

    constructor() {
        this.mcp = new Server(
            { name: "mcp_gateway", version: "1.0.0" },
            { capabilities: { tools: { listChanged: false } as any } }
        );
        this.tools = [];
        this.transport = new StreamableHTTPServerTransport({
            sessionIDGenerator: undefined,
            enableJsonResponse: false
        });
    }

    async connect() {
        await this.mcp.connect(this.transport);
    }

    async disconnect() {
        await this.transport.close();
    }

    setRequestHandler(request: any, handler: any) {
        this.mcp.setRequestHandler(request, handler);
    };

    handleRequest(request: any, response: any) {
        return this.transport.handleRequest(request, response, request.body);
    };

    errorHandler(error: any) {
        logger.error({ error }, "MCP request failed");
        this.transport.close();
        throw new ServiceException({
            success: false,
            statusCode: 500,
            message: "Internal server error",
            errorType: "internal_server_error",
        });
    };
}

export default MCPGatewayServer;