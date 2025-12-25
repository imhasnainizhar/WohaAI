import { OpenAIEmbeddings } from "@langchain/openai";
import { embedderModel } from "@db/memory/qdrant/embedder.js";
import { qdrantClient, QdrantClientType } from "@db/memory/qdrant/qdrant_client.js";
import { MemoryCollection, MemoryRecord, MemoryPoint, MemoryQueryResponse } from "../../../domain/types/store.js";
import { logger } from "@utils/logger.js";


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
    logger.debug(`Generating embedding for content: ${content.slice(0, 70)}...`);
    return await this.embedder.embedQuery(content);
  }

  async initCollections() {
    const collections: MemoryCollection[] = ["FACTS", "PREFERENCES", "PROJECTS", "EPISODIC"];

    for (const collection of collections) {
      logger.debug(`Initializing collection: ${collection}`);
      await this.client.createCollection(collection, {
        vectors: {
          size: 1536, // depends on your embedding model
          distance: "Cosine"
        }
      }).catch(() => {
        logger.debug(`${collection} collection already exists`);
      });
    }
  }

  async addMemory(record: MemoryRecord) {
    await this.client.upsert(record.collection, {
      wait: true,
      points: [
        {
          id: record.id,
          vector: record.embedding,
          payload: {
            content: record.content,
            userID: record.userID,
            collection: record.collection,
            createdAt: record.createdAt
          }
        } as MemoryPoint
      ]
    }).then(() => {
      logger.debug(`Memory added to collection: ${record.collection}`);
    }).catch((error) => {
      logger.error(`Error adding memory to collection: ${record.collection}`, error);
      throw error;
    });
  }

  async queryMemory(collection: MemoryCollection, embedding: number[], userId: string, topK = 5): Promise<MemoryQueryResponse[]> {
    const response = await this.client.search(collection, {
      vector: embedding,
      limit: topK,
      filter: {
        must: [
          {
            key: "userID",
            match: { value: userId },
          },
        ],
      },
      with_payload: true,
    });

    logger.debug(`Query response: ${JSON.stringify(response).slice(0, 270)}...`);
    return response.map((point) => {
      const payload = point.payload as Record<string, unknown> | null | undefined;
      return {
        id: String(point.id),
        userID: typeof payload?.userID === 'string' ? payload.userID : String(payload?.userID ?? ''),
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