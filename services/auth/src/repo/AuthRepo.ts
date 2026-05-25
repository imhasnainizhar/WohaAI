import { repoClients } from "@clients/RepoClients";
import { RepoClients } from '@clients/RepoClients';

export class AuthRepo {
    constructor(
        protected readonly repoClients: RepoClients
    ) { }

    async findUserWithUsername(username: string) {
        return await this.repoClients.prisma.user.findUnique({
            where: {
                username
            }
        })
    }

    async findUserWithEmail(email: string) {
        return await this.repoClients.prisma.user.findUnique({
            where: {
                email
            }
        })
    }

    async createSignupSession(sessionData: {
        userID: string
        signupSessionID: string
    }) {
        return await this.repoClients.redis.set(
            `session:${sessionData.signupSessionID}`,
            sessionData.userID
        )
    }
}