import { env } from "@packages/env-ts";
import { EmailAlreadyTakenError } from "@/errors/service-error";
import { getChangeEmailProducer } from "@/producer/change-emai";
import { setChangeEmailSessionCache, setVerificationCodeCache } from "@/redis/redis";
import { AuthRepo } from "@/repo/auth-repo";
import { ChangeEmailEvent } from "@packages/contracts/mailer";
import kafka from "../../../../../packages/config/kafka.json"


export interface RequestEmailChangeServiceParams {
    userID: string;
    newEmail: string;
}

export class RequestEmailChangeService {
    constructor(
        private readonly repo: AuthRepo
    ) { }

    public async execute({
        userID,
        newEmail
    }: RequestEmailChangeServiceParams): Promise<{success: boolean}> {
        const user = await this.repo.findUserWithEmail(newEmail);

        if (user) throw new EmailAlreadyTakenError();

        const sessionID = crypto.randomUUID();

        await setChangeEmailSessionCache({
            userID,
            sessionID,
            newEmail,
            createdOn: new Date
        })

        const producer = await getChangeEmailProducer()
        const event: ChangeEmailEvent = {
            sessionID,
            userID,
            newEmail,
            uriSessionToken: "http://localhost:8001/verify-change-email-session?sessionID=${sessionID}",
            createdOn: new Date
        }

        producer.send({
            topic: kafka.topics.changeEmail,
            messages: [
                {
                    value: JSON.stringify(event)
                }
            ]
        })

        return {
            success: true
        }
    }
}