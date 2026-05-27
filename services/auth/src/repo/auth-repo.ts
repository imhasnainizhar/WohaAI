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

    async getUserWithUsernameOrEmail(
        usernameOrEmail: {
            type: "username", value: string
        } | {
            type: "email", value: string
        }) {
        return await this.prisma.user.findFirst({
            where: {
                OR: [
                    { username: usernameOrEmail.value },
                    { email: usernameOrEmail.value },
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

    async findUserWithUsername(username: string): Promise<boolean> {
        const user = await this.prisma.user.findUnique({
            where: {
                username
            },
            select: {
                userID: true
            }
        });

        return !!user;
    }

    async findUserWithEmail(email: string): Promise<boolean> {
        const user = await this.prisma.user.findUnique({
            where: {
                email
            },
            select: {
                userID: true
            }
        });

        return !!user;
    }

    async findUserWithUsernameOrEmail(
        usernameOrEmail: {
            type: "username", value: string
        } | {
            type: "email", value: string
        }) {
        const user = await this.prisma.user.findFirst({
            where: {
                OR: [
                    { username: usernameOrEmail.value },
                    { email: usernameOrEmail.value },
                ],
            },
            select: {
                userID: true,
            },
        });

        return !!user;
    }

    /**
    * Find active user session
    */
    async findActiveSession({
        userID,
        userSessionID
    }: {
        userID: string,
        userSessionID: string
    }) {
        return await this.prisma.userSession.findFirst({
            where: {
                userID,
                userSessionID,
                revoked: false,
            },
            include: {
                user: true
            }
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
export type FindWithUsername = Awaited<ReturnType<AuthRepo["findUserWithUsername"]>>
export type FindWithEmail = Awaited<ReturnType<AuthRepo["findUserWithEmail"]>>
export type FindWithUsernameOrEmail = Awaited<ReturnType<AuthRepo["findUserWithUsernameOrEmail"]>>
export type FindActiveSessionResult = Awaited<ReturnType<AuthRepo["findActiveSession"]>>
export type RevokeSessionResult = Awaited<ReturnType<AuthRepo["revokeSession"]>>