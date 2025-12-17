import { env } from "@config/env.config.js";
import { QdrantClient } from "@qdrant/js-client-rest";

export const qdrantClient = new QdrantClient({ url: env.AGENT_MEMORY_STORE_URI }); // or your hosted Qdrant URL