import { AnnotationState } from "@workflows/ReactWorkflow.js";
import { logger } from "@utils/logger.js";
import { toolCallPrompt } from "@internals/prompts/tool_call.js";
import { toolCallModel } from "@llm_models/tool_call.js";
import { AIMessage, HumanMessage } from "langchain";
import { ToolCall } from "@langchain/core/messages";

export const toolCallNode = async (state: typeof AnnotationState.State) => {
    logger.debug("Tool Call Node Processing...");

    const llm = await toolCallModel();
    const toolCallSystemMessage = toolCallPrompt;

    // Convert planner_decision to a HumanMessage since llm.invoke expects messages
    const plannerDecisionMessage = new HumanMessage(
        JSON.stringify(state.planner_decision)
    );

    const toolCallOutput: AIMessage = await llm.invoke([
        toolCallSystemMessage,
        plannerDecisionMessage
    ])

    // When using bindTools, the LLM returns an AIMessage with tool_calls property
    const toolCalls: ToolCall[] = toolCallOutput.tool_calls || [];
    if (toolCalls.length === 0) {
        logger.error("No tool calls found");
        return {
            tool_calls: []
        }
    }
    return {
        tool_calls: toolCalls
    }
}