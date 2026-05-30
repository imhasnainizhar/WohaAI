import { Kafka, Producer } from "kafkajs";
import { env } from "@/config/env";
import { getProducer, kafkaClient } from "@packages/kafka";

/**
 * Get or create a Kafka producer for a forgot password topic
 */
export async function getForgotPasswordProducer(): Promise<Producer> {
    return await getProducer(
        env.AUTH_KAFKA_CLIENT_ID,
        env.AUTH_KAFKA_BROKERS,
        env.AUTH_KAFKA_FORGOT_PASSWORD_EVENTS_TOPIC
    )
}