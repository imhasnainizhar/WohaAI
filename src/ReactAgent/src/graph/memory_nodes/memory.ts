import { memoryPrompt } from "@internals/prompts/memory_prompt.js";
import { MemorySchema } from "@internals/schemas/memory.js";
import { memoryModel } from "@llm_models/memory.js";
import { logger } from "@utils/logger.js";
import { AnnotationState } from "@workflows/ReactWorkflow.js";
import { memoryStore } from "@db/memory/qdrant/store.js";
import { MemoryCollection, MemoryRecord } from "@internals/types/store.js";
import { HumanMessage } from "langchain";
import { connectMemoryRedis } from "@db/memory/redis/redis_client.js";
import { memoryRedisClient } from "@db/memory/redis/redis_client.js";

export const memoryNode = async (state: typeof AnnotationState.State) => {
  logger.debug("Memory Node Processing...");

  if (!state.userID) {
    return {
      memory: []
    }
  }

  await connectMemoryRedis();
  const redis = memoryRedisClient;

  try {
    const value = await redis.get(`memory:${state.userID}`);
    logger.debug(`MemoryNode: retrieved memory ${value}`);
  } catch (err) {
    logger.error(`No memory found for user ${state.userID}: ${err}`);
  }

  const llm = await memoryModel();

  // 1️⃣ Fetch memories FIRST (before planner)
  const memoryContext = await Promise.all([
    memoryStore.queryMemory("FACTS", await memoryStore.generateEmbedding("relevant facts"), state.userID ?? "", 7),
    memoryStore.queryMemory("PREFERENCES", await memoryStore.generateEmbedding("user preferences"), state.userID ?? "", 7),
    memoryStore.queryMemory("PROJECTS", await memoryStore.generateEmbedding("current projects"), state.userID ?? "", 7),
    memoryStore.queryMemory("EPISODIC", await memoryStore.generateEmbedding("episodic memories"), state.userID ?? "", 7),
  ]);

  const flattenedMemory = memoryContext
    .flat()
    .map((m) => `- ${m.content}`)
    .join("\n");


  // 2️⃣ Ask LLM if something should be stored
  // Convert input string to HumanMessage and include recent messages for context
  const inputMessage = new HumanMessage(state.input);

  const recentMessages = state.messages.slice(-6);
  // withStructuredOutput returns the structured object directly, not AIMessage
  const parsed = await llm.invoke([
    memoryPrompt,
    inputMessage,
    ...recentMessages,
  ]) as ReturnType<typeof MemorySchema.parse>;

  // 3️⃣ Persist memory if approved
  if (parsed.shouldStore && parsed.quadrant && parsed.memory) {
    await memoryStore.addMemory({
      id: crypto.randomUUID(),
      collection: parsed.quadrant as MemoryCollection,
      userID: state.userID,
      content: parsed.memory,
      embedding: await memoryStore.generateEmbedding(parsed.memory),
      createdAt: Date.now(),
    } as MemoryRecord);
    logger.debug(`MemoryNode: stored memory ${parsed.quadrant} in ${parsed.reason}`);
  }
  // Return memory as array of strings (as per state definition)
  // Include retrieved memories and any new memory to be stored

  const newLTM = flattenedMemory.concat(parsed.memory ?? "");
  const newSTM = {
    recentMessages: state.messages.slice(-6), // sliding window
    recentMemory: parsed.memory ?? "",
    fetchedLTM: flattenedMemory
  };

  await redis.set(`memory:${state.userID}`, JSON.stringify(newSTM));

  return {
    memory: newLTM,
  };
};