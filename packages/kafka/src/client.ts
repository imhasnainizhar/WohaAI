import { Kafka } from 'kafkajs';
import { envConfigs as env } from '@packages/config';

// KAFKA
export const kafkaClient = (kafkaClientID: string) => {
    return new Kafka({
    clientId: kafkaClientID,
  
    brokers: env.AUTH_KAFKA_BROKERS,
  });
}