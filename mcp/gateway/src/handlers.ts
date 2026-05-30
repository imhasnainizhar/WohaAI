import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';
import { Client } from "@modelcontextprotocol/sdk/client/index.js"
import { REGISTRY } from './registry.js';
import { mcpGatewayLogger as logger } from '@packages/observability';
import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { asyncHandler } from './middlewares/async-handler.js';


export const listToolsHandler = 
    asyncHandler( async () => {
    logger.debug({ action: "list_tools_requested" }, "List tools request received");
    
    const allTools: Tool[] = [];
    for (const reg of REGISTRY) {
        logger.debug({ action: "connecting_to_registry", registryId: reg.id, url: reg.url }, `Connecting to registry ${reg.id}`);
        
        const proxyClient = new Client({
            name: `${reg.id} Proxy`,
            version: "1.0.0"
        });
        
        const clientTransport = new StreamableHTTPClientTransport(new URL(reg.url));
        await proxyClient.connect(clientTransport);
        try {
            const toolRequest = await proxyClient.listTools();
            logger.debug({ 
                action: "tools_listed", 
                registryId: reg.id, 
                toolCount: toolRequest.tools.length,
                toolNames: toolRequest.tools.map(t => t.name)
            }, `Found ${toolRequest.tools.length} tools in registry ${reg.id}`);
            
            for (const tool of toolRequest.tools) {
                allTools.push({
                    ...tool,
                });
            }
        } catch (error: any) {
            logger.error({ action: "list_tools_error", registryId: reg.id, error: error.message }, `Error listing tools from registry ${reg.id}`);
        } finally {
            await clientTransport.close();
        }
    };
    
    logger.debug({ action: "list_tools_completed", totalTools: allTools.length }, `List tools completed: ${allTools.length} total tools`);
    return { tools: allTools }
})

export const callToolHandler = 
    asyncHandler( async (request: any) => {
    logger.debug({ 
        action: "call_tool_request_received", 
        fullRequest: JSON.stringify(request, null, 2)
    }, "Full callTool request received");
    
    // MCP SDK passes params differently - extract from request
    const params = request.params || request;
    const toolName = params.name || params.toolName;
    const toolArgs: any = params.arguments || params.args || {};

    logger.debug({ 
        action: "call_tool_requested", 
        toolName, 
        toolArgs: JSON.stringify(toolArgs),
        paramsKeys: Object.keys(params)
    }, `Tool call requested: ${toolName}`);


    for (const reg of REGISTRY) {
        logger.debug({ action: "connecting_to_registry_for_tool", registryId: reg.id, url: reg.url, toolName: toolName }, `Connecting to registry ${reg.id} for tool ${toolName}`);

        const proxyClient = new Client({ name: `${reg.id} Proxy`, version: "1.0.0" });
        const clientTransport = new StreamableHTTPClientTransport(new URL(reg.url), { requestInit: { headers: reg.headers } });
        await proxyClient.connect(clientTransport);

        try {
            // Cache tools list per registry to avoid multiple calls
            const toolsList = await proxyClient.listTools();
            const hasTool = toolsList.tools.find(t => t.name === toolName);
            if (hasTool) {
                logger.debug({ action: "tool_found_calling", registryId: reg.id, toolName: toolName }, `Tool ${toolName} found, calling`);
                const result = await proxyClient.callTool({ name: toolName, arguments: toolArgs });
                logger.debug({ action: "tool_call_completed", registryId: reg.id, toolName: toolName, hasResult: !!result }, `Tool ${toolName} call completed`);
                return result;
            }
        } catch (error: any) {
            logger.error({ action: "tool_call_error", registryId: reg.id, toolName: toolName, error: error.message, stack: error.stack }, `Error calling tool ${toolName}`);
            throw error;
        } finally {
            await clientTransport.close();
        }
    }

    logger.warn({ action: "tool_not_found_anywhere", toolName: toolName, registryId: "undefined" }, `Tool ${toolName} not found in any registry`);
    return {};
})