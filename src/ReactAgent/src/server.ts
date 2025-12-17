import express, { Request, Response, Router } from "express"
import { logger } from "@utils/logger"
import { env } from "@config/env.config"
import router from "@server/chat.route";

const PORT = parseInt(env.WOAHAI_LLM_AGENT_PORT);

const app = express();

app.use(express.json());

app.use("/", router);

app.listen(PORT, () => logger.info(`WoahAI LLM Runtime Deployed on Port ${PORT}`));