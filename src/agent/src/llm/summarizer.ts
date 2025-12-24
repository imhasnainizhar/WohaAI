import { env } from "@config/env.js";
import { ChatOpenAI } from "@langchain/openai";

export async function summarizerModel() {
  return new ChatOpenAI({
    modelName: "gpt-4o-2024-08-06",
    temperature: 0,
    maxRetries: 2,
    maxTokens: 4000,
    apiKey: env.OPENAI_API_KEY
  });
}