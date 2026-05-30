import { Kafka } from 'kafkajs';
import { envConfigs as env } from '@packages/config';

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