import { Kafka, Producer } from "kafkajs";
import { env } from "@packages/config";

// Singleton Kafka client
const kafka = new Kafka({
  clientId: env.AUTH_MAILER_KAFKA_CLIENT_ID,
  brokers: env.AUTH_MAILER_KAFKA_BROKERS
});

// Cache producers per topic
const producers = new Map<string, Producer>();

/**
 * Get or create a Kafka producer for a topic
 */
export async function getProducer(topic: string): Promise<Producer> {
  if (producers.has(topic)) {
    return producers.get(topic)!;
  }

  const producer = kafka.producer();

  await producer.connect();

  producers.set(topic, producer);
  return producer;
}
