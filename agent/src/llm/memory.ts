import { ChatOpenAI } from "@langchain/openai";
import { Runnable } from "@langchain/core/runnables";
import { MemorySchema, MemorySchemaType } from "../internals/schemas/memory.js";
import { env } from "@/config/env.js";

let cachedModel: Runnable | null = null;

export async function memoryModel(): Promise<Runnable> {
    if (cachedModel) return cachedModel;

    const baseModel = new ChatOpenAI({
        model: "gpt-4o",
        temperature: 0,
        maxTokens: 4000,
        apiKey: env.OPENAI_API_KEY,
    });
    cachedModel = baseModel.withStructuredOutput<MemorySchemaType>(MemorySchema);
    return cachedModel;
}