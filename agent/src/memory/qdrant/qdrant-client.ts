import { env } from "@/config/env.js";
import { QdrantClient } from "@qdrant/js-client-rest";
import { agentLogger as logger } from '@packages/observability';

let cachedQdrantClient: QdrantClient | null = null;
if (cachedQdrantClient) cachedQdrantClient;

export const qdrantClient = new QdrantClient({ url: env.AGENT_MEMORY_QDRANT_URI, apiKey: env.AGENT_MEMORY_QDRANT_API_KEY }); // or your hosted Qdrant URL
cachedQdrantClient = qdrantClient;


logger.debug(`Qdrant client connected to store on URL: ${env.AGENT_MEMORY_QDRANT_URI}`);

export type QdrantClientType = typeof qdrantClient;