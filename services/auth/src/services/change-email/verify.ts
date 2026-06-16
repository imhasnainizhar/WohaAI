import { env } from "@packages/env-ts";
import { EmailAlreadyTakenError } from "@/errors/service-error";
import { getChangeEmailProducer } from "@/producer/change-emai";
import { getChangeEmailSessionCache, setChangeEmailSessionCache, setVerificationCodeCache } from "@/redis/redis";
import { AuthRepo } from "@/repo/auth-repo";
import { ChangeEmailEvent } from "@packages/contracts/mailer";
import { authLogger as logger } from "@packages/observability";

export interface VerifyEmailChangeServiceParams {
    sessionID: string;
}

export class VerifyEmailChangeService {
    constructor(
        private readonly repo: AuthRepo
    ) { }

    public async execute({
        sessionID
    }: VerifyEmailChangeServiceParams): Promise<{success: boolean}> {

        const cache = await getChangeEmailSessionCache(sessionID)

        const user = await this.repo.changeEmail({
            userID: cache.userID,
            newEmail: cache.newEmail
        })

        logger.debug("Email Changed to" + cache.newEmail)

        return {
            success: user
        }
    }
}