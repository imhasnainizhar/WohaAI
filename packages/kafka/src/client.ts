import { Kafka } from 'kafkajs';

// KAFKA
export const kafkaClient = (
    kafkaClientID: string,
    brokers: string[]
) => {
    return new Kafka({
    clientId: kafkaClientID,
    brokers
  });
}