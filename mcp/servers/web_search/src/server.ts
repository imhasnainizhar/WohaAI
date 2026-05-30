import bodyParser from "body-parser";
import express from "express";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { server as mcpServer } from "./mcp";
import { env } from "@config/env";
import { logger } from "@utils/logger";

const PORT = Number(env.WEB_SEARCH_MCP_PORT);
const app = express();

app.use(bodyParser.json());

logger.info("🧩 Booting Web MCP server...");

// ✅ Create transport ONCE
const transport = new StreamableHTTPServerTransport({
  sessionIDGenerator: undefined,
  enableJsonResponse: true
});

// ✅ Connect server to transport ONCE
async function connectServer() {
  await mcpServer.connect(transport);
}
connectServer();

// ✅ Only handle requests here
app.use("/mcp", async (req, res) => {
  logger.debug({
    action: "mcp_request_received",
    method: req.method,
    path: req.path,
    body: req.body
  });

  try {

    // // These sre commented out because of temporary fix for gateway server
    // res.on("close", () => {
    //   transport.close();
    //   logger.debug({
    //     action: "mcp_request_completed",
    //     method: req.method,
    //     path: req.path
    //   });
    // });

    // res.on("error", (err: any) => {
    //   transport.close();
    //   logger.error({ err }, "MCP request failed");
    // });

    await transport.handleRequest(req, res, req.body);
  } catch (err: any) {
    logger.error({ err }, "MCP request failed");
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  logger.info(`Web MCP is running on ${PORT}`);
});
