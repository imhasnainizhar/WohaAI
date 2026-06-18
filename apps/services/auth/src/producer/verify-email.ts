import { Kafka, Producer } from "kafkajs";
import { getProducer } from "@wohaai/kafka";
import kafka from "../../../../../packages/config/kafka.json";
import { env } from "@wohaai/env-ts";


/**
 * Get or create a Kafka producer for email verification topic
 */
export async function getEmailVerificationProducer(): Promise<Producer> {
  return await getProducer(
    env.AUTH_KAFKA_CLIENT_ID,
    [env.AUTH_KAFKA_BROKER],
    kafka.topics.emailVerification
  )
}