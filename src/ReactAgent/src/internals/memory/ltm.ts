// ltm.ts
import { QuadrantVectorStore } from "@internals/memory/store";
import { Embedder } from "@internals/memory/embedder";
import { MemoryQuadrant } from "@internals/types/store";

export class LTM {
  constructor(
    private store: QuadrantVectorStore,
    private embedder: Embedder
  ) {}

  async remember(
    quadrant: MemoryQuadrant,
    content: string,
    metadata?: Record<string, any>
  ) {
    const embedding = await this.embedder.embed(content);

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
    const embedding = await this.embedder.embed(query);
    return this.store.search(quadrant, embedding, topK);
  }
}
