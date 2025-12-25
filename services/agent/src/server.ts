import express, { Request, Response, Router } from "express"
import { logger } from "@utils/logger.js"
import { env } from "@config/env.js"
import router from "@server/chat.route.js";

const PORT = parseInt(env.WOAHAI_LLM_AGENT_PORT);

const app = express();

app.use(express.json());

app.use("/", router);

app.listen(PORT, () => logger.info(`WoahAI LLM Runtime Deployed on Port ${PORT}`));