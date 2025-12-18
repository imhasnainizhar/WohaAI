import { memoryPrompt } from "@internals/prompts/memory_prompt.js";
import { memoryDecisionSchema } from "@internals/schemas/memory.schema.js";
import { memoryModel } from "@llm_models/memory.model.js";
import { logger } from "@utils/logger.js";
import { AnnotationState } from "@workflows/ReactWorkflow.js";
import { memoryStore, MemoryStore } from "@internals/memory/store.js";
import { MemoryQuadrant } from "@internals/memory/store.js";

export const memoryNode = async (state: typeof AnnotationState.State) => {
  logger.debug("MemoryNode: start");

  const llm = await memoryModel(state);


  // 1️⃣ Fetch memories FIRST (before planner)
  const memoryContext = await Promise.all([
    memoryStore.queryMemory("FACTS", await memoryStore.generateEmbedding("relevant facts")),
    memoryStore.queryMemory("PREFERENCES", await memoryStore.generateEmbedding("user preferences")),
    memoryStore.queryMemory("PROJECTS", await memoryStore.generateEmbedding("current projects")),
    memoryStore.queryMemory("EPISODIC", await memoryStore.generateEmbedding("episodic memories")),
  ]);

  const flattenedMemory = memoryContext
    .flat()
    .map((m) => `- ${m.content}`)
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
    await memoryStore.addMemory({
      id: crypto.randomUUID(),
      quadrant: parsed.quadrant as MemoryQuadrant,
      content: parsed.memory,
      embedding: await memoryStore.generateEmbedding(parsed.memory),
      timestamp: Date.now(),
    });
    logger.debug(`MemoryNode: stored memory ${parsed.quadrant} in ${parsed.reason}`);
  }

  return state;
};
