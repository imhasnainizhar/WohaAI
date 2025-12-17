import { HumanMessage, SystemMessage, AIMessage } from "langchain";
import { logger } from "@utils/logger";
import { AnnotationState } from "@workflows/ReactWorkflow";
import initChatPrompt from "@internals/prompts/init_chat_prompt";
import { workflowTransitionLogger } from "@utils/workflowTransitionLogger";
import { chatModel } from "@models/chat.model";

export const InitChatNode = async (state: typeof AnnotationState.State) => {
  try {
    logger.debug("InitChatNode Processing...");

    if (!state.input || state.input.trim() === "") {
      return { messages: [new SystemMessage("Empty user input")], errorMessages: ["Empty user input"]};
    }

    const llm = await chatModel();

    const systemPrompt = initChatPrompt;

    const humanPrompt = new HumanMessage(state.input);

    const refinerResult = await llm.invoke([
      systemPrompt,
      humanPrompt
    ]);

    if (!refinerResult.content) {
      throw new Error("Refiner returned empty output");
    }

    let refinedPayload: any;
    try {
      refinedPayload = JSON.parse(refinerResult.content as string);
    } catch {
      throw new Error("Refiner output is not valid JSON");
    }

    logger.debug("InitChatNode: Refinement successful");
    workflowTransitionLogger("InitChatNode", () => "Planner");

    return {
      messages: [
        new SystemMessage(
          `Planner input (refined):\n${JSON.stringify(refinedPayload, null, 2)}`
        )
      ],
      refinedInput: JSON.stringify(refinedPayload)
    };

  } catch (error: any) {
    logger.error(`InitChatNode error: ${error.message}`);

    return {
      messages: [
        new SystemMessage(`REFINER_ERROR: ${error.message}`)
      ],
      errorMessages: [error.message]
    };
  }
};
