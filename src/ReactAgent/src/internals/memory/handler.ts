import { QuadrantVectorStore } from "@internals/memory/store";
import { MemoryQuadrant } from "@internals/types/store";
import { OpenAIEmbeddings } from "@langchain/openai";
import { embedderModel } from "@internals/memory/embedder";

export class MemoryHandler {
  constructor(
    private store: QuadrantVectorStore,
    private embedder: OpenAIEmbeddings = embedderModel
  ) {}

  async remember(
    quadrant: MemoryQuadrant,
    content: string,
    metadata?: Record<string, any>
  ) {
    const embedding = await this.embedder.embedQuery(content);

    this.store.add({
      id: crypto.randomUUID(),
      quadrant,
      content,
      embedding,
      metadata,
      createdAt: Date.now(),
    });
  }

  async recall(
    quadrant: MemoryQuadrant,
    query: string,
    topK = 5
  ) {
    const embedding = await this.embedder.embedQuery(query);
    return this.store.search(quadrant, embedding, topK);
  }
}

export const memoryHandler = new MemoryHandler(new QuadrantVectorStore(), embedderModel);