import { kafkaClient } from "./client";


export const getConsumer = (
    {
        kafkaClientID,
        brokers,
        consumerGroupID
    }: {
        kafkaClientID: string
        brokers: string[]
        consumerGroupID: string
    }) => {
    const kafka = kafkaClient(kafkaClientID, brokers)
    return kafka.consumer({
        groupId: consumerGroupID
    })
}