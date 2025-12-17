import { AIMessage } from "langchain";
import { AnnotationState } from "@workflows/ReactWorkflow";
import { plannerModel } from "@models/planner.model";
import { logger } from "@utils/logger";
import { plannerPrompt } from "@internals/prompts/planner_prompt";
import { PlannerOutput } from "@internals/types/agent";
import { JsonOutputParser } from "@langchain/core/output_parsers";

// Planner node decides: call tools OR proceed to summarizer
export const plannerNode = async (state: typeof AnnotationState.State) => {
    logger.debug("Planner Node Processing...");

    const llm = await plannerModel();

    const plannerSystemMessage = plannerPrompt;

    logger.debug(`Planner context size: ${state.messages.length}`);

    // Invoke LLM
    const plannerOutput: AIMessage = await llm.invoke([
        plannerSystemMessage,
        ...state.messages
    ]);

    const parser = new JsonOutputParser<PlannerOutput>();
    const plannerContent = plannerOutput.content as string;
    const decision = await parser.parse(plannerContent);

    logger.debug(`Planner decision: ${JSON.stringify(decision)}`);

    return {
        planner_decision: decision,
        messages: [plannerOutput],
        tool_calls: decision?.action === "Tools" ? state.tool_calls : [],
        summarizer_path: decision?.action === "Summarize" ? true : false
    };
};
