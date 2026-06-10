import { env } from "@/config/env";
import { EmailAlreadyTakenError } from "@/errors/service-error";
import { getChangeEmailProducer } from "@/producer/change-emai";
import { setChangeEmailSessionCache, setVerificationCodeCache } from "@/redis/redis";
import { AuthRepo } from "@/repo/auth-repo";
import { ChangeEmailEvent } from "@packages/contracts/mailer";


export interface RequestEmailChangeServiceParams {
    id: string;
    newEmail: string;
}

export interface RequestEmailChangeServiceResponse {
    verificationEmailSent: boolean;
}

export class RequestEmailChangeService {
    constructor(
        private readonly repo: AuthRepo
    ) { }

    public async execute({
        id,
        newEmail
    }: RequestEmailChangeServiceParams): Promise<RequestEmailChangeServiceResponse> {
        const user = await this.repo.findUserWithEmail(newEmail);

        if (user) throw new EmailAlreadyTakenError();

        const sessionID = crypto.randomUUID();

        await setChangeEmailSessionCache({
            id,
            sessionID,
            newEmail,
            createdOn: new Date
        })

        const producer = await getChangeEmailProducer()
        const event: ChangeEmailEvent = {
            sessionID,
            id,
            newEmail,
            uriSessionToken: "http://localhost:8001/verify-change-email-session?sessionID=${sessionID}",
            createdOn: new Date
        }

        producer.send({
            topic: env.AUTH_KAFKA_CHANGE_EMAIL_EVENTS_TOPIC,
            messages: [
                {
                    value: JSON.stringify(event)
                }
            ]
        })

        return {
            verificationEmailSent: true
        }
    }
}