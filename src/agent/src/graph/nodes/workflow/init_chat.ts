import { HumanMessage, SystemMessage } from "langchain";
import { logger } from "@utils/logger.js";
import { AnnotationState } from "@workflows/react.js";
import initChatPrompt from "@internals/prompts/init_chat.js";
import { workflowTransitionLogger } from "@utils/workflow_logger.js";
import { chatModel } from "src/llm(s)/chat.js";

export const InitChatNode = async (state: typeof AnnotationState.State) => {
  try {
    logger.debug("InitChatNode Processing...");

    logger.debug(`ID: ${state.userID}`);

    if (!state.input || state.input.trim() === "") {
      return { messages: [new SystemMessage("Empty user input")], errorMessages: ["Empty user input"] };
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
