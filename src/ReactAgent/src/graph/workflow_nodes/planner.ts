import { AIMessage } from "langchain";
import { AnnotationState } from "@workflows/ReactWorkflow.js";
import { plannerModel } from "../../llm_models/planner.model.js";
import { logger } from "@utils/logger.js";
import { plannerPrompt } from "@internals/prompts/planner_prompt.js";
import { JsonOutputParser } from "@langchain/core/output_parsers";
import crypto from "crypto";
import { PlannerDecision, ToolCall } from "@internals/schemas/planner.schema.js";

// Planner node decides: call tools OR proceed to summarizer
export const plannerNode = async (state: typeof AnnotationState.State) => {
  logger.debug("Planner Node Processing...");

  const llm = await plannerModel();
  const plannerSystemMessage = plannerPrompt;

  logger.debug(`Planner context size: ${state.messages.length}`);

  // Invoke LLM
  const plannerOutput: AIMessage = await llm.invoke([
    plannerSystemMessage,
    ...state.summarized_tool_output,
    ...state.messages,
  ]);

  const plannerContent = Array.isArray(plannerOutput)
    ? plannerOutput[0].content
    : plannerOutput.content;

  logger.debug(`Planner raw content: ${plannerContent}`);

  const parser = new JsonOutputParser<PlannerDecision>();
  let decision: PlannerDecision = {
    action: "Respond",
    reason: "No decision made",
    tool_calls: [],
  };

  try {
    // Parse planner output into typed PlannerDecision
    decision = await parser.parse(plannerContent);
  } catch (err: any) {
    logger.error(`Planner JSON parse failed: ${JSON.stringify(err)}`);
    decision = {
      action: "Respond",
      reason: err.message,
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
  const toolCalls: ToolCall[] =
    decision?.tool_calls?.map((tc) => ({
      ...tc,
      id: crypto.randomUUID(),
      type: "tool_call",
    })) ?? [];

  // Build AIMessage with structured tool_calls
  const plannerMessage = new AIMessage({
    ...plannerOutput,
    content: "", // content not used when tool_calls exist
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
    tool_calls: decision?.action === "Tools" ? toolCalls : [],
    tool_messages: [],
    summarizer_path: decision?.action === "Summarize",
  };
};
