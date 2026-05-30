import express, { Request, Response } from "express";
import { env } from '@/config/env.js';
import { mcpGatewayLogger as logger } from '@packages/observability';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import MCPGatewayServer from './gateway.js';
import { listToolsHandler,callToolHandler } from './handlers.js';
import { InternalServerError } from "@packages/errors";
import { errorHandler } from "./middlewares/error-handler.js";

const PORT = parseInt(env.MCP_GATEWAY_PORT, 10)

const app = express();
app.use(express.json());

const gatewayServer = new MCPGatewayServer();

// Register handlers once
gatewayServer.setRequestHandler(ListToolsRequestSchema, listToolsHandler);
gatewayServer.setRequestHandler(CallToolRequestSchema, callToolHandler);

// Connect transport once at startup
gatewayServer.connect().then(() => {
    logger.info("MCP server connected to transport");
});

// Express route
app.use("/mcp", async (req: Request, res: Response) => {

    logger.debug({
        action: "mcp_request_received",
        method: req.method,
        path: req.path,
        body: req.body
    }, "MCP request received at gateway");

    try {
        await gatewayServer.handleRequest(req, res);
        logger.debug({ action: "mcp_request_completed", method: req.method, path: req.path }, "MCP request completed");
    } catch (err: any) {
        logger.error({
            action: "mcp_request_error",
            method: req.method,
            path: req.path,
            error: err.message,
            stack: err.stack
        }, `Error handling MCP request: ${err.message}`);
        throw new InternalServerError(err)
        }
    }
);

app.use(errorHandler)

app.listen(PORT, () => {
    logger.info(`MCP Gateway running on PORT ${PORT}`);
});