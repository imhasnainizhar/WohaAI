import { MemoryRecord, MemoryQuadrant } from "@internals/types/store";
import { cosineSimilarity } from "@utils/cosine_similarity";

export class QuadrantVectorStore {
  private store: Record<MemoryQuadrant, MemoryRecord[]> = {
    FACTS: [],
    PREFERENCES: [],
    PROJECTS: [],
    EPISODIC: [],
  };

  add(record: MemoryRecord) {
    this.store[record.quadrant].push(record);
  }

  search(
    quadrant: MemoryQuadrant,
    queryEmbedding: number[],
    topK = 5
  ): MemoryRecord[] {
    return this.store[quadrant]
      .map(r => ({
        record: r,
        score: cosineSimilarity(r.embedding, queryEmbedding),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, topK)
      .map(r => r.record);
  }

  purgeEpisodic(ttlMs: number) {
    const now = Date.now();
    this.store.EPISODIC = this.store.EPISODIC.filter(
      r => now - r.createdAt < ttlMs
    );
  }
}
