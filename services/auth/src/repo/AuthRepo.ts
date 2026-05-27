import { InternalServerError } from "@packages/errors";
import { logger } from "@packages/observability";
import { PrismaClient } from "@packages/prisma";

export class AuthRepo {
    constructor(
        protected readonly prisma: PrismaClient
    ) { }

    async getUserWithUsername(username: string) {
        return await this.prisma.user.findUnique({
            where: {
                username
            }
        })
    }

    async getUserWithEmail(email: string) {
        return await this.prisma.user.findUnique({
            where: {
                email
            }
        })
    }

    async getUserWithUsernameOrEmail(usernameOrEmail: string) {
        return await this.prisma.user.findFirst({
            where: {
                OR: [
                    { username: usernameOrEmail },
                    { email: usernameOrEmail },
                ],
            },
            select: {
                userID: true,
                profilePicURI: true,
                userFirstName: true,
                userLastName: true,
                email: true,
                username: true,
                hashedPassword: true,
            },
        });
    }

    /**
    * Find active user session
    */
    async findActiveSession(
        userID: string,
        userSessionID: string
    ) {
        return await this.prisma.userSession.findFirst({
            where: {
                userID,
                userSessionID,
                revoked: false,
            },
        });
    }

    /**
    * Revoke session in database
    */
    async revokeSession(
        userSessionID: string
    ) {
        try {
            return await this.prisma.userSession.update({
                where: { userSessionID },
                data: {
                    revoked: true,
                    revokedAt: new Date(),
                },
            });
        } catch (err) {
            logger.error({
                message:
                    "[SIGNOUT] Prisma error updating session",
                userSessionID,
                error: err,
            });

            throw new InternalServerError(err);
        }
    }

}

export type GetUserWithUsernameOrEmailResult = Awaited<ReturnType<AuthRepo["getUserWithUsernameOrEmail"]>>
export type GetUserWithUsernameResult = Awaited<ReturnType<AuthRepo["getUserWithUsername"]>>
export type GetUserWithEmailResult = Awaited<ReturnType<AuthRepo["getUserWithEmail"]>>
export type FindActiveSessionResult = Awaited<ReturnType<AuthRepo["findActiveSession"]>>
export type RevokeSessionResult = Awaited<ReturnType<AuthRepo["revokeSession"]>>