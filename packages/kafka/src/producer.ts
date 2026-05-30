import { Kafka, Producer } from "kafkajs";
import { kafkaClient } from "./client";


export const producers = new Map<string, Producer>();

export const getProducer = async (
    kafkaClientID: string,
    brokers: string[],
    topic: string
) => {
    if (producers.has(topic)) {
        return producers.get(topic)!;
    }

    const kafka = kafkaClient(kafkaClientID, brokers)

    const producer = kafka.producer();

    await producer.connect();

    producers.set(topic, producer);
    return producer;
}