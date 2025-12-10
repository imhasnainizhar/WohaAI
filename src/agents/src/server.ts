import express, { Request, Response } from "express"
import { logger } from "@utils/logger"
import { env } from "@config/env.config"


const PORT = parseInt(env.WOAHAI_LLM_AGENT_PORT, 10);

const app = express();
app.use(express.json());



app.listen(PORT, () => logger.info(`WoahAI LLM Runtime Deployed on Port ${PORT}`));