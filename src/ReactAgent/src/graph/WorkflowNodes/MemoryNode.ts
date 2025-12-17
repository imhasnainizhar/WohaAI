import { memoryPrompt } from "@internals/prompts/memory_prompt";
import { memoryDecisionSchema } from "@internals/schemas/memory.schema";
import { memoryModel } from "@llm_models/memory.model";
import { logger } from "@utils/logger";
import { AnnotationState } from "@workflows/ReactWorkflow";
import { memoryHandler } from "@internals/memory/handler";
import { MemoryQuadrant, MemoryRecord } from "@internals/types/store";

export const memoryNode = async (state: typeof AnnotationState.State) => {
  logger.debug("MemoryNode: start");

  const llm = await memoryModel(state);


  // 1️⃣ Fetch memories FIRST (before planner)
  const memoryContext = await Promise.all([
    memoryHandler.recall("FACTS", "relevant facts"),
    memoryHandler.recall("PREFERENCES", "user preferences"),
    memoryHandler.recall("PROJECTS", "current projects"),
  ]);

  const flattenedMemory = memoryContext
    .flat()
    .map((m: MemoryRecord) => `- ${m.content}`)
    .join("\n");

  // Inject memories into state
  state.memory = flattenedMemory;

  // 2️⃣ Ask LLM if something should be stored
  const decision = await llm.invoke(
    [
      memoryPrompt,
      ...state.messages.slice(-6), // recent context only
    ],
    {
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "MemoryDecision",
          schema: memoryDecisionSchema.shape,
          strict: true,
        },
      },
    }
  );

  const parsed = memoryDecisionSchema.parse(decision);

  // 3️⃣ Persist memory if approved
  if (parsed.shouldStore && parsed.quadrant && parsed.memory) {
    await memoryHandler.remember(parsed.quadrant as MemoryQuadrant, parsed.memory);
    logger.debug(`MemoryNode: stored memory ${parsed.quadrant} in ${parsed.reason}`);
  }

  return state;
};
