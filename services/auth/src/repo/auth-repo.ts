import { ClientData, UserSession } from "@packages/contracts/auth";
import { InternalServerError } from "@packages/errors";
import { logger } from "@packages/observability";
import { PrismaClient } from "@packages/prisma";
import argon2 from "argon2";

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
    * Create user session
    */
    async createUserSession({
        userID,
        clientData,
        refreshToken,
        userSessionID,
    }: {
        userID: string;

        clientData: ClientData;

        refreshToken: string;

        userSessionID?: string;
    }): Promise<UserSession> {
        try {
            const refreshTokenHash =
                await argon2.hash(
                    refreshToken
                );

            if (
                !clientData.userIPAddress
            ) {
                logger.warn(
                    "⚠️ [SESSION] Missing client IP — defaulting to 'unknown'"
                );
            }

            const session =
                await this.prisma.userSession.create(
                    {
                        data: {
                            userSessionID:
                                userSessionID ??
                                "Unknown",

                            refreshTokenHash,

                            userID,

                            revoked: false,

                            userIPAddress:
                                clientData.userIPAddress ??
                                "Unknown",

                            userDeviceName:
                                clientData.userDeviceName ??
                                "Unknown Device",

                            userDeviceType:
                                clientData.userDeviceType ??
                                "Unknown",

                            userDeviceBrowser:
                                clientData.userDeviceBrowser ??
                                "Unknown",

                            userDeviceOS:
                                clientData.userDeviceOS ??
                                "Unknown",
                        },

                        include: {
                            user: {
                                select: {
                                    userID: true,
                                    email: true,
                                    userFirstName: true,
                                    userLastName: true,
                                },
                            },
                        },
                    }
                );
            return session;
        } catch (err: any) {
            logger.error({
                message:
                    "❌ [SESSION] Failed to create user session",

                error:
                    err?.message || err,
            });

            throw new InternalServerError(
                err
            );
        }
    }

    async refreshSession({
        userSessionID,
        refreshToken,
        ip,
    }: {
        userSessionID: string;
        refreshToken: string;
        ip: string;
    }) {
        const hash = await argon2.hash(refreshToken);

        try {
            return await this.prisma.userSession.update({
                where: { userSessionID },
                data: {
                    refreshTokenHash: hash,
                    revokedAt: null,
                    userIPAddress: ip,
                },
            });
        } catch (err: unknown) {
            throw new InternalServerError(err);
        }
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

export type CreateUserSessionResult = Awaited<ReturnType<AuthRepo["createUserSession"]>>;
export type FindActiveSessionResult = Awaited<ReturnType<AuthRepo["findActiveSession"]>>
export type RevokeSessionResult = Awaited<ReturnType<AuthRepo["revokeSession"]>>