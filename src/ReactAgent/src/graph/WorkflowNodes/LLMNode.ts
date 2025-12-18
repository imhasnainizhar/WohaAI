import { openAiModelWithTools } from "@models/chat.model";

export default async function llmNode() {
    return await openAiModelWithTools();
}