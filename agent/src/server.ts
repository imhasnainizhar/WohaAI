import express, { Request, Response, Router } from "express"
import { logger } from "./logger/logger.js"
import { env } from "@config/env.js"
import router from "@server/chat.route.js";

const PORT = parseInt(env.WohaAI_LLM_AGENT_PORT);

const app = express();

app.use(express.json());

app.use("/", router);

app.listen(PORT, () => logger.info(`WohaAI LLM Runtime Deployed on Port ${PORT}`));