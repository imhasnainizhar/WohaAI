// Module declared at ./domain/modules/fluvio.d.ts
import { Fluvio, Producer } from "@fluvio/client";
import { env } from "@config/env";

// Fluvio configs
const fluvioConfig = {
    url: env.AUTH_FLUVIO_API_URI,
};

let producer: typeof Producer | null = null;

async function getProducer(topic: string): Promise<typeof Producer> {
    if (producer) return producer;

    const fluvio = new Fluvio();
    await fluvio.connect(fluvioConfig);
    producer = await fluvio.topicProducer(topic);

    return producer;
}

export default getProducer;




