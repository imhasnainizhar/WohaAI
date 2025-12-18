import { logger } from "@utils/logger.js";
import { AnnotationState } from "@workflows/ReactWorkflow.js";
import { SystemMessage, BaseMessage, HumanMessage, AIMessage } from "langchain";
import responsePrompt from "@internals/prompts/response_prompt.js";
import { chatModel } from "../../llm_models/chat.model.js";

export const responseNode = async (state: typeof AnnotationState.State) => {
    try {
        logger.debug("ResponseNode Processing...");

        const llm = await chatModel();

        const responseSystemMessage = responsePrompt;

        const summarizedToolOutput = new SystemMessage({
            content: state.summarized_tool_output.length
              ? `Context from tools:\n${state.summarized_tool_output.join("\n\n")}`
              : "No external tool context was required."
        });

        const finalMessages: BaseMessage[] = [
            responseSystemMessage,
            new HumanMessage(state.refinedInput || ""),
            summarizedToolOutput
        ];

        const finalResult: AIMessage = await llm.invoke(finalMessages);

        logger.debug(`Response result: ${JSON.stringify(finalResult.content)}`);

        if (!finalResult.content || finalResult.content === "") {
            throw new Error("No response from LLM");
        }

        return { messages: [finalResult], output: finalResult.content };
    } catch (error: any) {
        logger.error(`Error at ResponseNode: ${error.message}, ${error.stack}`);
        return { messages: [new SystemMessage(`ERROR: ${error.message}`)], output: error.message };
    }
};
