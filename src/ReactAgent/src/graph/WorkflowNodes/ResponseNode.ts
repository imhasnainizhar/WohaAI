import { logger } from "@utils/logger";
import { AnnotationState } from "@workflows/ReactWorkflow";
import { SystemMessage, BaseMessage, HumanMessage, AIMessage } from "langchain";
import llmNode from "./LLMNode";
import responsePrompt from "@internals/prompts/response_prompt";

export const responseNode = async (state: typeof AnnotationState.State) => {
    try {
        logger.debug("ResponseNode Processing...");

        const llm = await llmNode();

        const responseSystemMessage = responsePrompt;

        const summarizedToolOutput = new SystemMessage({
            content: state.summarized_tool_output.length
              ? `Context from tools:\n${state.summarized_tool_output.join("\n\n")}`
              : "No external tool context was required."
        });

        const systemMessages = state.messages.filter(
            (m) => m.type === "human" || m.type === "ai"
        );

        const finalMessages: BaseMessage[] = [
            responseSystemMessage,
            new HumanMessage(state.refinedInput || ""),
            ...systemMessages,
            summarizedToolOutput
        ];

        const finalResult: AIMessage = await llm.invoke(finalMessages);

        logger.debug(`Response result: ${JSON.stringify(finalResult)}`);

        if (!finalResult.content || finalResult.content === "") {
            throw new Error("No response from LLM");
        }

        return { messages: [finalResult], output: finalResult.content };
    } catch (error: any) {
        logger.error(`Error at ResponseNode: ${error.message}, ${error.stack}`);
        return { messages: [new SystemMessage(`ERROR: ${error.message}`)], output: error.message };
    }
};
