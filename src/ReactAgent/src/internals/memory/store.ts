import { OpenAIEmbeddings } from "@langchain/openai";
import { embedderModel } from "@internals/memory/embedder.js";
import { qdrantClient, QdrantClientType } from "@internals/memory/qdrant_client.js";
import { MemoryCollection, MemoryRecord, MemoryPoint, MemoryQueryResponse } from "@internals/types/store.js";


export class MemoryStore {
  private client: QdrantClientType;
  private embedder: OpenAIEmbeddings;
  constructor(
    client: QdrantClientType = qdrantClient,
    embedder: OpenAIEmbeddings = embedderModel
  ) {
    this.client = client;
    this.embedder = embedder;
  }

  async generateEmbedding(content: string) {
    return await this.embedder.embedQuery(content);
  }

  async initCollections() {
    const collections: MemoryCollection[] = ["FACTS", "PREFERENCES", "PROJECTS", "EPISODIC"];

    for (const collection of collections) {
      await this.client.createCollection(collection, {
        vectors: {
          size: 1536, // depends on your embedding model
          distance: "Cosine"
        }
      }).catch(() => {
        console.log(`${collection} collection already exists`);
      });
    }
  }

  async addMemory(record: MemoryRecord) {
    await this.client.upsert(record.collection, {
      wait: true,
      points: [
        {
          id: crypto.randomUUID(),
          vector: record.embedding,
          payload: {
            content: record.content,
            userId: record.userId,
            username: record.username ?? undefined,
            collection: record.collection,
            createdAt: Date.now()
          }
        } as MemoryPoint
      ]
    })
  }

  async queryMemory(collection: MemoryCollection, embedding: number[], userId: string, topK = 5 ): Promise<MemoryQueryResponse[]> {
    const response = await this.client.search(collection, {
      vector: embedding,
      limit: topK,
      filter: {
        must: [
          {
            key: "userId",
            match: { value: userId },
          },
        ],
      },
      with_payload: true,
    });

    return response.map((point) => {
      const payload = point.payload as Record<string, unknown> | null | undefined;
      return {
        id: String(point.id),
        userId: typeof payload?.userId === 'string' ? payload.userId : String(payload?.userId ?? ''),
        username: typeof payload?.username === 'string' ? payload.username : undefined,
        content: typeof payload?.content === 'string' ? payload.content : String(payload?.content ?? ''),
        score: point.score ?? 0,
        collection: typeof payload?.collection === 'string' ? payload.collection as MemoryCollection : collection,
        createdAt: typeof payload?.createdAt === 'number' ? payload.createdAt : Date.now(),
      };
    });
  }
};

export const memoryStore = new MemoryStore();
export type MemoryStoreType = typeof MemoryStore;