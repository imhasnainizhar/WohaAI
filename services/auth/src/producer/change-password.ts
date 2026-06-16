import { Producer } from "kafkajs";
import { getProducer } from "@packages/kafka";
import kafka from "../../../../packages/config/kafka.json";
import { env } from "@packages/env-ts";

/**
 * Get or create a Kafka producer for a forgot password topic
 */
export async function getChangePasswordProducer(): Promise<Producer> {
    return await getProducer(
        env.AUTH_KAFKA_CLIENT_ID!,
        [env.AUTH_KAFKA_BROKER],
        kafka.topics.changePassword
    )
}