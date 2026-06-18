import { getChangeEmailSessionCache } from "@/redis/redis";
import { AuthRepo } from "@/repo/auth-repo";
import { authLogger as logger } from "@wohaai/telemetry";
import { TSessionID } from "@wohaai/validations";

export interface VerifyEmailChangeServiceParams {
    sessionID: TSessionID;
}

export class VerifyEmailChangeService {
    constructor(
        private readonly repo: AuthRepo
    ) { }

    public async execute({
        sessionID
    }: VerifyEmailChangeServiceParams): Promise<{ success: boolean }> {

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