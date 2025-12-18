import { AIMessage, BaseMessage, SystemMessage } from "langchain";
import { AnnotationState } from "@workflows/ReactWorkflow";
import { openAiModelWithTools } from "@models/chat.model";
import { logger } from "@utils/logger";
import plannerPrompt from "@internals/prompts/planner_prompt";

// Planner node decides: call tools OR proceed to summarizer
export const plannerNode = async (state: typeof AnnotationState.State) => {
    logger.debug("Planner Node Processing...");

    const llm = await openAiModelWithTools();

    const plannerSystemMessage = plannerPrompt;

    logger.debug(`Planner context size: ${state.messages.length}`);

    // Invoke LLM
    const plannerOutput: AIMessage = await llm.invoke([
        plannerSystemMessage,
        ...state.messages
    ]);

    const summarized_need = typeof plannerOutput.content === "string" && plannerOutput.content.includes("summarizer_path");
    if (summarized_need) {
        state.summarizer_path = true;
    } else {
        state.summarizer_path = false;
    }
    
    // 🚨 Enforce ReAct contract
    if (
        plannerOutput.tool_calls &&
        plannerOutput.tool_calls.length > 0 &&
        typeof plannerOutput.content === "string" &&
        plannerOutput.content.length > 0
    ) {
        throw new Error("Planner must not emit content when tool_calls exist");
    }

    const hasToolCalls = plannerOutput.tool_calls && plannerOutput.tool_calls.length > 0;
    const summarizerPath = !hasToolCalls && summarized_need;

    if (hasToolCalls) {
        logger.info(`Planner emitted ${plannerOutput.tool_calls?.length ?? 0} tool call(s) → Tool path 🔧`);
    } else if (!hasToolCalls && summarizerPath) {
        logger.info("Planner emitted no tool calls, Choosed summarizer → Summarizer path 📝");
    } else if (!hasToolCalls && !summarizerPath) {
        logger.info("Planner emitted no tool calls, No summarizer → Response path 🚀");
    }

    return {
        messages: [plannerOutput],
        tool_calls: plannerOutput.tool_calls ?? [],
        summarizer_path: summarizerPath
    };
};
