import express, { Request, Response, Router } from "express"
import { agentLogger as logger } from '@packages/observability';
import { env } from "@/config/env.js"
import router from "@/server/route.js";

const PORT = parseInt(env.AI_AGENT_PORT);

const app = express();

app.use(express.json());

app.use("/", router);

app.listen(PORT, () => logger.info(`WohaAI LLM Runtime Deployed on Port ${PORT}`));