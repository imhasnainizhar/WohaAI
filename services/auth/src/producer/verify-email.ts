import { Kafka, Producer } from "kafkajs";
import { env } from "@/config/env";
import { getProducer } from "@packages/kafka";



/**
 * Get or create a Kafka producer for email verification topic
 */
export async function getEmailVerificationProducer(): Promise<Producer> {
  return await getProducer(
      env.AUTH_KAFKA_CLIENT_ID,
      env.AUTH_KAFKA_BROKERS,
      env.AUTH_KAFKA_EMAIL_VERIFICATION_EVENTS_TOPIC
  )
}