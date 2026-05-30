import { memoryPrompt } from "../../../internals/prompts/memory.js";
import { MemorySchema } from "../../../internals/schemas/memory.js";
import { memoryModel } from "../../../llm/memory.js";
import { agentLogger as logger } from '@packages/observability';
import { AnnotationState } from "@/workflows/react.js";
import { memoryStore } from "@/memory/qdrant/store.js";
import { MemoryCollection, MemoryRecord } from "../../../internals/types/store.js";
import { HumanMessage } from "langchain";
import { redisClient } from "@/redis/redis-client.js";
import crypto from "crypto";

export const memoryNode = async (state: typeof AnnotationState.State) => {
  logger.debug("Memory Node Processing...");

  // Guard against undefined state or missing userID
  if (!state || !state.userID || state.userID.trim() === "") {
    logger.debug("Memory Node: No userID provided, skipping memory operations");
    return {
      memory: ""
    }
  }

  // try {
  //   await connectMemoryRedis();
  // } catch (err: any) {
  //   logger.warn(`Failed to connect to Memory Redis, continuing without memory cache: ${err.message}`);
  //   // Continue without Redis - memory operations will still work with Qdrant
  // }


  // Only use Redis if connected
  if (redisClient && redisClient.redis) {
    try {
      const value = await redisClient.getCache(`memory:${state.userID}`);
      logger.debug(`MemoryNode: retrieved memory ${value}`);
    } catch (err: any) {
      logger.warn(`Failed to retrieve memory from Redis for user ${state.userID}: ${err.message}`);
      // Continue without Redis cache
    }
  } else {
    logger.debug('Memory Redis not connected, skipping cache operations');
  }

  (async () => {
    await memoryStore.initCollections();
    console.log("Qdrant collections initialized");
  })();

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
  if (parsed.shouldStore && parsed.quadrant && parsed.memory && state.userID) {
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

  // Only set Redis if userID exists and Redis is connected
  if (state.userID && redisClient.redis) {
    try {
      await redisClient.setCache(`memory:${state.userID}`, JSON.stringify(newSTM));
    } catch (err: any) {
      logger.warn(`Failed to save memory to Redis for user ${state.userID}: ${err.message}`);
      // Continue without Redis cache - memory is still stored in Qdrant
    }
  }
  return {
    memory: newLTM,
  };
};