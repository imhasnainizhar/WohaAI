import { Kafka, Producer } from "kafkajs";
import { env } from "@config/env";

// Singleton Kafka client
const kafka = new Kafka({
  clientId: env.KAFKA_AUTH_CLIENT_ID,
  brokers: env.KAFKA_AUTH_BROKERS.split(","), // e.g. "localhost:9092"
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
