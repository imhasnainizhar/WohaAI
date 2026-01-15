// import Fluvio, { RecordSet } from "@fluvio/client";
// import { env } from "@config/env";

// // Cache producers per topic
// const producers = new Map<
//   string,
//   Awaited<ReturnType<InstanceType<typeof Fluvio>["topicProducer"]>>
// >();

// /**
//  * Get or create a Fluvio producer for a topic
//  */
// export async function getProducer(topic: string) {
//   if (producers.has(topic)) {
//     return producers.get(topic)!;
//   }

//   // Connect the client once
//   const fluvio = await Fluvio.connect({
//     // Optional: host override; leave blank to use your default config
//     host: env.AUTH_FLUVIO_API_URI,
//   });

//   // Create the producer from the instance
//   const producer = await fluvio.topicProducer(topic);

//   producers.set(topic, producer);
//   return producer;
// }
