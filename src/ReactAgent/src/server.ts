import express, { Request, Response } from "express"
import { logger } from "@utils/logger"
import { env } from "@config/env.config"
import { llmRuntime } from "./runtime";


(async () => {
    const r = await llmRuntime(
        JSON.stringify({ input: "Hello" })
    )
})

async function init() {
    const r = await llmRuntime("What is tesla net worth?");
    logger.info(`Output: ${r}`);
}

init()

// const PORT = parseInt(env.WOAHAI_LLM_AGENT_PORT, 10);

// const app = express();
// app.use(express.json());

// app.post("/chat", async (req: Request, res: Response) => {
//     try {
//         const input = req.body.input;
//         if (!input) {
//             return res.status(400).json({ error: "Missing input field in body" });
//         }

//         const result = await llmRuntime(input);
//         return res.json({ result });
//     } catch (err: any) {
//         logger.error({ action: "llm_runtime_error", error: err.message }, "Error in LLM runtime");
//         return res.status(500).json({ error: "Internal server error" });
//     }
// });



// app.listen(PORT, () => logger.info(`WoahAI LLM Runtime Deployed on Port ${PORT}`));