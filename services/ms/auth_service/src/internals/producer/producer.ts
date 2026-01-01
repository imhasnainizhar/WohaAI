// Module declared at @internals/modules/fluvio.d.ts
import { Fluvio, Producer } from "@fluvio/client";
import { env } from "@config/env";

// Fluvio configs
const fluvioConfig = {
    url: env.AUTH_FLUVIO_API_URI,
};

// Declaring producer as typeof Producer, init as null
// To cache producer for future uses.
let producer: typeof Producer | null = null;

/**
 * This function returns a producer for the fluvio event-streaming.
 * If producer is already initialized, it returns the cached producer.
 * 
 * @param topic The topic name for the producer.
 * We take this param's topic name from env mostly.
 * 
 * @returns producer
 */
export async function getProducer(topic: string): Promise<typeof Producer> {
    // If producer is already initialized, return it
    if (producer) return producer;

    // Otherwise, create a new producer
    const fluvio = new Fluvio();

    // Connect to fluvio
    await fluvio.connect(fluvioConfig);

    // Create producer
    producer = await fluvio.topicProducer(topic);

    // Return producer
    return producer;
}



