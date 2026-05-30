import { ClientData, Password, UserSession } from "@packages/contracts/auth";
import { InternalServerError, NormalizedError, PrismaError } from "@packages/errors";
import { authLogger } from "@packages/observability";
import { PrismaClient } from "@packages/prisma-users";
import argon2 from "argon2";

/**
 * Taking SessionDuration from @packages/prisma-users UserSession Model export
 */
import { SessionDuration } from "@packages/prisma-users";


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

    async getUserWithUserID(userID: string) {
        return await this.prisma.user.findUnique({
            where: {
                userID
            }
        })
    }

    async changeUserPassword({
        userID, 
        hashedPassword
    }: {
        userID: string;
        hashedPassword: string;
    }) {
        try {
            const updatedUser = await this.prisma.user.update({
                where: { userID },
                data: {
                    hashedPassword,
                },
                select: {
                    userID: true,
                    username: true,
                },
            });
        
            return updatedUser;                
        } catch (error: unknown) {
            throw new PrismaError(error)
        }
    }

    async getUserWithUsernameOrEmail(
        usernameOrEmail: {
            type: "username", value: string
        } | {
            type: "email", value: string
        }) {
            try{
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
                firstName: true,
                lastName: true,
                email: true,
                username: true,
                hashedPassword: true,
            },
        })
    } catch (err: any) {
        console.error(err);
        throw new PrismaError(err)
    };
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
        sessionDuration,
        userSessionID,
    }: {
        userID: string;
        clientData: ClientData;
        refreshToken: string;
        sessionDuration: SessionDuration,
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
                authLogger.warn(
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
                            sessionDuration,
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
                                    firstName: true,
                                    lastName: true,
                                },
                            },
                        },
                    }
                );
            return session;
        } catch (err: any) {
            authLogger.error({
                message:
                    "❌ [SESSION] Failed to create user session",

                error:
                    err?.message || err,
            });

            throw new NormalizedError(
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
            authLogger.error({
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

export type ChangeUserPasswordResult = Awaited<ReturnType<AuthRepo["changeUserPassword"]>>