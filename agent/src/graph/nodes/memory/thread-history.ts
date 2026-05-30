// nodes/threadHistory.node.ts
import { v7 as uuidv7 } from "uuid";
import { AnnotationState } from "@/workflows/react.js";
import { agentLogger as logger } from '@packages/observability';
import { AIMessage } from "langchain";
import { threadsPrismaClient } from '@packages/prisma-threads';

export async function threadHistoryNode(
  state: typeof AnnotationState.State
): Promise<typeof AnnotationState.State> {
  logger.debug("ThreadHistory Node Processing...");

  if (!state.threadID) {
    logger.warn("No threadID found, skipping thread history save");
    return state;
  }

  // Expect exactly one user → one AI for this workflow
  const userMessage: string = state.input;
  // Get the last AIMessage with content (final response), not planner messages with only tool_calls
  const aiMessage = state.messages
    .filter(m => m instanceof AIMessage && m.content && (typeof m.content === 'string' ? m.content.trim() !== '' : true))
    .slice(-1)[0];

  logger.debug(`User message: ${userMessage}`);
  logger.debug(`AI message: ${aiMessage?.content}`);
  if (!userMessage || !aiMessage) {
    logger.warn("Incomplete turn (user or AI missing), skipping persistence");
    return state;
  }

  try {
    // 1️⃣ Save user message first
    await threadsPrismaClient.threadMessage.create({
      data: {
        id: uuidv7(),
        conversationId: state.threadID,
        role: "user",
        content: userMessage,
      },
    });

    // 2️⃣ Save AI message second
    await threadsPrismaClient.threadMessage.create({
      data: {
        id: uuidv7(),
        conversationId: state.threadID,
        role: "assistant",
        content:
          typeof aiMessage.content === "string"
            ? aiMessage.content
            : JSON.stringify(aiMessage.content),
      },
    });

    logger.debug(`Saved 1 conversation turn to thread ${state.threadID}`);
  } catch (error) {
    logger.error(`Error saving thread history: ${String(error)}`);
  }

  return state;
}
