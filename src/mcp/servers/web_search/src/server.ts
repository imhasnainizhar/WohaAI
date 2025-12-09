import bodyParser from 'body-parser';
import { logger } from "@utils/logger";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { server as mcpServer } from "./mcp";
import { env } from "@config/env.config";
import express, { Request, Response } from 'express';

const PORT = parseInt(env.WEB_SEARCH_MCP_PORT, 10);
const app = express();

app.use(bodyParser.json());

// Expose the MCP server over HTTP so the gateway can reach it
app.use("/mcp", async (req: Request, res: Response) => {
  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
    enableJsonResponse: true
  });

  res.on("close", async () => transport.close());

  await mcpServer.connect(transport);
  await transport.handleRequest(req, res, req.body);
});

console.log("🧩 Booting Web MCP server...");

app.listen(PORT, () => logger.info(`Web MCP is running on ${PORT}`));