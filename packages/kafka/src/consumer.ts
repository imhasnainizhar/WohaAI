import { kafkaClient } from "./client";


export const getConsumer = (
    {
        kafkaClientID, 
        consumerGroupID
    }: {
        kafkaClientID: string
        consumerGroupID: string
    }) => {
    const kafka = kafkaClient(kafkaClientID)
    return kafka.consumer({
        groupId: consumerGroupID
    })
}