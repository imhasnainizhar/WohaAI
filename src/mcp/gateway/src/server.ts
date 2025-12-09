import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import express, { Request, Response } from "express";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { Server } from "@modelcontextprotocol/sdk/server/index.js"
import { env } from '@config/env.config';
import { ListToolsRequestSchema, CallToolRequestSchema, Tool } from '@modelcontextprotocol/sdk/types.js';
import { Client } from "@modelcontextprotocol/sdk/client/index.js"
import { REGISTRY } from './registry';
import { RegisteredServer } from '@custom_types/gateway';
import { logger } from '@utils/logger';


const gatewayServer = new Server(
    {
        name: "mcp_gateway",
        version: "1.0.0",
    },
    {
        capabilities: {
            tools: {}
        }
    }
);


const PORT = parseInt(env.MCP_GATEWAY_PORT, 10)

const app = express();
app.use(express.json());

app.use("/mcp", async (req: Request, res: Response) => {
    const transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: undefined,
        enableJsonResponse: true
    })

    res.on("close",
        async () => transport.close()
    );

    gatewayServer.setRequestHandler(ListToolsRequestSchema, async () => {
        const allTools: Tool[] = [];
        const toolMap = new Map<string, any>();
        for (const reg of REGISTRY) {
            const proxyClient = new Client({
                name: `${reg.id} Proxy`,
                version: "1.0.0"
            });
            const clientTransport = new StreamableHTTPClientTransport(new URL(reg.url));
            await proxyClient.connect(clientTransport);
            try {
                const toolRequest = await proxyClient.listTools();
                for (const tool of toolRequest.tools) {
                    toolMap.set(`${reg.id}/${tool.name}`, reg)
                    allTools.push({
                        ...tool,
                        name: `${reg.id}/${tool.name}`
                    });
                }
            } finally {
                await clientTransport.close();
            }
        };
        return { tools: allTools }
    })

    gatewayServer.setRequestHandler(CallToolRequestSchema, async (req) => {
        const toolName = req.params.name;

        // "Any" Type is under review!
        const toolArgs: any = req.params.args ?? {};

        for (const reg of REGISTRY) {
            const proxyClient = new Client({
                name: `${reg.id} Proxy`,
                version: "1.0.0"
            });
            await proxyClient.connect(new StreamableHTTPClientTransport(
                new URL(reg.url),
                {
                    requestInit: {
                        headers: reg.headers
                    }
                }
            ));

            const toolsList = proxyClient.listTools();
            const hasTool = (await toolsList).tools.find(e => toolName === e.name);
            if (hasTool) {
                return await proxyClient.callTool({
                    name: toolName,
                    arguments: toolArgs
                })
            }
        };
        return {};
    })

    await gatewayServer.connect(transport);
    await transport.handleRequest(req, res, req.body);

});

app.listen(PORT, () => logger.info(`MCP Gateway running on PORT ${PORT}`));