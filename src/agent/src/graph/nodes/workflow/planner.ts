import { AIMessage, HumanMessage, ToolMessage } from "langchain";
import { AnnotationState } from "@workflows/react.js";
import { plannerModel } from "src/llm(s)/planner.js";
import { logger } from "@utils/logger.js";
import { plannerPrompt } from "@internals/prompts/planner.js";
import crypto from "crypto";
import { PlannerDecision, PlannerToolCall } from "@internals/schemas/planner.js";

// Planner node decides: call tools OR proceed to summarizer
export const plannerNode = async (state: typeof AnnotationState.State) => {
  logger.debug("Planner Node Processing...");

  const llm = await plannerModel();
  const plannerSystemMessage = plannerPrompt;

  logger.debug(`Planner context size: ${state.messages.length}`);

  // Invoke LLM - withStructuredOutput returns the structured object directly
  let decision: PlannerDecision = {
    action: "Respond",
    reason: "No decision made",
    tool_calls: [],
  };

  try {
    // Convert summarized_tool_output (strings) to HumanMessages
    const summarizedToolMessages = state.summarized_tool_output.length > 0
      ? [new HumanMessage(`Summarized tool outputs:\n${state.summarized_tool_output.join("\n\n")}`)]
      : [];

    // withStructuredOutput returns PlannerDecision directly, not AIMessage
    decision = await llm.invoke([
      plannerSystemMessage,
      ...summarizedToolMessages,
      ...state.messages,
    ]) as PlannerDecision;

    logger.debug(`Planner decision received: ${JSON.stringify(decision)}`);
  } catch (err: any) {
    logger.error(`Planner invocation failed: ${JSON.stringify(err)}`);
    decision = {
      action: "Respond",
      reason: err.message || "LLM invocation failed",
      tool_calls: [],
    } as PlannerDecision;
  }

  logger.debug(
    `Planner decision: ${JSON.stringify({
      action: decision?.action,
      tool_calls: decision?.tool_calls,
    })}`
  );

  // Assign unique IDs for each tool call
  const toolCalls: PlannerToolCall[] =
    decision?.tool_calls?.map((tc) => ({
      ...tc,
      id: crypto.randomUUID(),
      type: "tool_call",
    })) ?? [];

  // Build AIMessage with structured tool_calls
  const plannerMessage = new AIMessage({
    content: JSON.stringify(decision) ?? "", // content not used when tool_calls exist
    tool_calls: toolCalls,
    id: crypto.randomUUID(),
  });

  logger.debug(
    `Planner message prepared: ${JSON.stringify({
      tool_calls: toolCalls,
      type: "ai",
    })}`
  );

  return {
    planner_decision: decision,
    messages: [plannerMessage],
    // tool_calls: decision?.action === "Tools" ? toolCalls : [],
    tool_calls: toolCalls,
    tool_messages: [],
    summarizer_path: decision?.action === "Summarize",
  };
};
