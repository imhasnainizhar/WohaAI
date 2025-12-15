import { openAiModelWithTools } from "@internals/llms/chat.model";

export default async function llmNode() {
    return await openAiModelWithTools();
}