import { HumanMessage, SystemMessage } from "langchain";
import { AnnotationState } from "@workflows/ReactWorkflow";
import { openAiModelWithTools } from "@internals/llms/chat.model";
import { logger } from "@utils/logger";

// Web search node
export const webSearchNode = async (
  state: typeof AnnotationState.State
) => {
  try {
    // Guard: do not run search if tools are unresolved
    if (state.tool_calls?.length) {
      throw new Error(
        "WebSearch blocked: pending tool calls must be resolved first"
      );
    }

    logger.debug("Web Search Node processing...");

    const llm = await openAiModelWithTools();

    const systemMessage = new SystemMessage(
      `You may call the web search tool to obtain webpage URLs
       for up-to-date information. These URLs will be scraped later.
       When a tool is required, return a ToolCall object in JSON format
       with a name and args.`
    );

    const result = await llm.invoke([
      ...state.messages,
      systemMessage,
      new HumanMessage(state.refinedInput),
    ]);

    logger.debug(`Web Result: ${result}`);

    const updatedMessages = [...state.messages, result];
    const updatedToolCalls = result.tool_calls ?? [];

    return {
      ...state,
      messages: updatedMessages,
      tool_calls: updatedToolCalls,
    };
  } catch (error) {
    logger.error({
      node: "WebSearch",
      error,
      toolCalls: state.tool_calls,
      messageCount: state.messages.length,
    });

    /**
     * IMPORTANT:
     * Do NOT throw — return state so routing can continue or terminate cleanly
     */
    return state;
  }
};
