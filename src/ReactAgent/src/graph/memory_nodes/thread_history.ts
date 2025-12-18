// nodes/threadHistory.node.ts
import { v7 as uuidv7 } from "uuid";
import { prismaClient } from "@db/threads/prisma/prisma_client.js";
import { AnnotationState } from "@workflows/ReactWorkflow.js";
import { logger } from "@utils/logger.js";
import { HumanMessage, AIMessage } from "langchain";

// Save conversation history to database
export async function threadHistoryNode(
  state: typeof AnnotationState.State
): Promise<typeof AnnotationState.State> {
  logger.debug("ThreadHistory Node Processing...");

  if (!state.threadID) {
    logger.warn("No threadID found, skipping thread history save");
    return state;
  }

  try {
    // Get the last user message and AI response
    const userMessages = state.messages.filter(m => m instanceof HumanMessage);
    const aiMessages = state.messages.filter(m => m instanceof AIMessage);

    const lastUserMessage = userMessages[userMessages.length - 1];
    const lastAiMessage = aiMessages[aiMessages.length - 1];

    // Save user message if it exists and hasn't been saved
    if (lastUserMessage) {
      const existingUserMessage = await prismaClient.threadMessage.findFirst({
        where: {
          conversationId: state.threadID,
          role: "user",
          content: typeof lastUserMessage.content === "string" 
            ? lastUserMessage.content 
            : JSON.stringify(lastUserMessage.content),
        },
        orderBy: { turnId: "desc" },
      });

      if (!existingUserMessage) {
        await prismaClient.threadMessage.create({
          data: {
            id: uuidv7(),
            conversationId: state.threadID,
            role: "user",
            content: typeof lastUserMessage.content === "string" 
              ? lastUserMessage.content 
              : JSON.stringify(lastUserMessage.content),
          },
        });
        logger.debug(`Saved user message to thread ${state.threadID}`);
      }
    }

    // Save AI response if it exists and hasn't been saved
    if (lastAiMessage && lastAiMessage.content) {
      const existingAiMessage = await prismaClient.threadMessage.findFirst({
        where: {
          conversationId: state.threadID,
          role: "assistant",
          content: typeof lastAiMessage.content === "string" 
            ? lastAiMessage.content 
            : JSON.stringify(lastAiMessage.content),
        },
        orderBy: { turnId: "desc" },
      });

      if (!existingAiMessage) {
        await prismaClient.threadMessage.create({
          data: {
            id: uuidv7(),
            conversationId: state.threadID,
            role: "assistant",
            content: typeof lastAiMessage.content === "string" 
              ? lastAiMessage.content 
              : JSON.stringify(lastAiMessage.content),
          },
        });
        logger.debug(`Saved AI message to thread ${state.threadID}`);
      }
    }
  } catch (error) {
    logger.error(`Error saving thread history: ${error}`);
  }

  return state;
}