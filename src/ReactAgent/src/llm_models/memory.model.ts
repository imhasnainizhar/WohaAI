import { ChatOpenAI } from "@langchain/openai";
import { AnnotationState } from "@workflows/ReactWorkflow";

let cachedModel: ChatOpenAI | null = null;

export async function memoryModel(state: typeof AnnotationState.State) {
    if (!cachedModel) {
        cachedModel = new ChatOpenAI({
            model: "gpt-4o-mini",
            temperature: 0,
            maxTokens: 4000,
            apiKey: process.env.OPENAI_API_KEY,
        });
        return cachedModel;
    }
    return cachedModel;
}