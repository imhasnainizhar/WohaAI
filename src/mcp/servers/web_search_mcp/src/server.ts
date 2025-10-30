import bodyParser from 'body-parser';
import express from "express";
import router from "@routes/web_mcp.routes";
import { env } from "@config/env.config";
import { logger } from "@utils/logger";

const PORT = parseInt(env.WEB_SEARCH_MCP_PORT, 10) || 3000;
const app = express();

app.use(bodyParser.json());
app.use("/web", router)

console.log("🧩 Booting Web MCP server...");

app.listen(PORT, () => logger.info(`Web MCP is running on ${PORT}`))