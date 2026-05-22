import { env } from "@config/env.js";
import { QdrantClient } from "@qdrant/js-client-rest";
import { logger } from "../../../logger/logger.js";

let cachedQdrantClient: QdrantClient | null = null;
if (cachedQdrantClient) cachedQdrantClient;

export const qdrantClient = new QdrantClient({ url: env.MEMORY_QDRANT_STORE_URI, port: env.MEMORY_QDRANT_STORE_PORT }); // or your hosted Qdrant URL
cachedQdrantClient = qdrantClient;


logger.debug(`Qdrant client connected to store on URL: ${env.MEMORY_QDRANT_STORE_URI} and port: ${env.MEMORY_QDRANT_STORE_PORT}`);

export type QdrantClientType = typeof qdrantClient;