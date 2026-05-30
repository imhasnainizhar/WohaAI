import express from "express";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { server as mcpServer } from "./mcp.js";
import { env } from "@/config/env.js";
import { mcpGatewayLogger as logger } from "@packages/observability";
import { sendResponse } from "@packages/http";
import { ServiceError } from "@packages/errors";

const PORT = Number(env.WEB_SEARCH_MCP_PORT);
const app = express();

app.use(express.json());

logger.info("🧩 Booting Web MCP server...");

// ✅ Create transport ONCE
const transport = new StreamableHTTPServerTransport({
  sessionIdGenerator: undefined,
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
    if (err instanceof ServiceError) {
      logger.debug({
        message: "[SIGNOUT_ERROR]",
        errorType: err.errorType,
        errorMessage: err.message,
        statusCode: err.statusCode,
        errors: err.errors,
        path: req.originalUrl,
        method: req.method,
        ip: req.ip,
      });

      return sendResponse({
        res,
        success: false,
        statusCode: err.statusCode,
        message: err.message,
        errors: err.errors,
        errorType: err.errorType,
        path: req.originalUrl,
      });
    }

    // Unexpected/unhandled errors
    logger.error({
      message:
        "Unhandled application error",
      path: req.originalUrl,
      error:
        err instanceof Error
          ? err.stack
          : String(err),
    });

    return sendResponse({
      res,
      success: false,
      statusCode: 500,
      message:
        "Internal server error",
      errorType:
        "internal_server_error",
      path: req.originalUrl,
    });
  }
});

app.listen(PORT, () => {
  logger.info(`Web MCP is running on ${PORT}`);
});
