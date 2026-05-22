import { logger } from "../../logger/logger.js";
import { Request, Response } from "express";
import { llmRuntime } from "../../runtime.js";

export const chatController = async (req: Request, res: Response) => {
    try {
        const input = req.body.input;
        if (!input) {
            return res.status(400).json({ error: "Missing input field in body" });
        }

        const result = await llmRuntime(input);
        return res.json({ result });
    } catch (err: any) {
        logger.error({ action: "llm_runtime_error", error: err.message }, "Error in LLM runtime");
        return res.status(500).json({ error: "Internal server error" });
    }
}