import { ClientData, UserSession } from "@wohaai/types";
import { InternalServerError, MongooseError, NormalizedError } from "@wohaai/errors";
import { authLogger } from "@wohaai/telemetry";
import { User, UserSession as Session } from "@wohaai/db"
import argon2 from "argon2";

export class AuthRepo {
    constructor(
        private readonly user = User,
        private readonly userSession = Session
    ) { }

    async getUserWithUsername(username: string) {
        return await this.user.findOne({
            username
        })
    }
    async getUserWithEmail(email: string) {
        return await this.user.findOne({
            email
        })
    }
    async getUserWithUserID(userID: string) {
        return await this.user.findById(userID)
    }

    async changeUserPassword({
        userID,
        hashedPassword
    }: {
        userID: string;
        hashedPassword: string;
    }) {
        try {
            const updatedUser = await this.user.findOneAndUpdate(
                { userID },
                {
                    hashedPassword,
                },
                {
                    new: true,
                    projection: {
                        userID: 1,
                        username: 1,
                    }
                }
            );

            return updatedUser;
        } catch (error: unknown) {
            throw new MongooseError(error)
        }
    }
    async getUserWithUsernameOrEmail(
        usernameOrEmail: {
            type: "username", value: string
        } | {
            type: "email", value: string
        }) {
        try {
            return await this.user.findOne(
                {
                    $or: [
                        { username: usernameOrEmail.value },
                        { email: usernameOrEmail.value },
                    ],
                },
                {
                    userID: 1,
                    profilePicURI: 1,
                    fullName: 1,
                    email: 1,
                    username: 1,
                    hashedPassword: 1,
                }
            )
        } catch (err: any) {
            console.error(err);
            throw new MongooseError(err)
        };
    }

    async findUserWithEmail(email: string): Promise<boolean> {
        const user = await this.user.findOne(
            { email },
            { userID: 1 }
        );

        return !!user;
    }

    async findUserWithUsername(username: string): Promise<boolean> {
        const user = await this.user.findOne(
            { username },
            { userID: 1 }
        );

        return !!user;
    }

    async findUserWithUsernameOrEmail(
        usernameOrEmail: {
            type: "username", value: string
        } | {
            type: "email", value: string
        }) {
        const user = await this.user.findOne(
            {
                $or: [
                    { username: usernameOrEmail.value },
                    { email: usernameOrEmail.value },
                ],
            },
            { userID: 1 }
        );

        return !!user;
    }

    async changeEmail({
        userID,
        newEmail
    }: {
        userID: string;
        newEmail: string;
    }) {
        try {
            const changed = await this.user.findOneAndUpdate(
                { userID },
                {
                    email: newEmail
                },
                {
                    new: true
                }
            )

            return !!changed;
        } catch (error: any) {
            throw new NormalizedError(error);
        }
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
                await argon2.hash(refreshToken);

            if (!clientData.userIPAddress) {
                authLogger.warn(
                    "⚠️ [SESSION] Missing client IP — defaulting to 'unknown'"
                );
            }

            const session =
                await this.userSession.create({
                    userSessionID: userSessionID ?? "Unknown",
                    refreshTokenHash,
                    userID,
                    revoked: false,
                    userIPAddress: clientData.userIPAddress ?? "Unknown",
                    userDeviceName: clientData.userDeviceName ?? "Unknown Device",
                    userDeviceType: clientData.userDeviceType ?? "Unknown",
                    userDeviceBrowser: clientData.userDeviceBrowser ?? "Unknown",
                    userDeviceOS: clientData.userDeviceOS ?? "Unknown",
                });

            return session;
        } catch (err: any) {
            authLogger.error({
                message: "❌ [SESSION] Failed to create user session",
                error: err?.message || err,
            });

            throw new NormalizedError(err);
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
            return await this.userSession.findOneAndUpdate(
                { userSessionID },
                {
                    refreshTokenHash: hash,
                    revokedAt: null,
                    userIPAddress: ip,
                },
                { new: true }
            );
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
        return await this.userSession.findOne({
            userID,
            userSessionID,
            revoked: false,
        }).populate("user");
    }

    /**
    * Revoke session in database
    */
    async revokeSession(
        userSessionID: string
    ) {
        try {
            return await this.userSession.findOneAndUpdate(
                { userSessionID },
                {
                    revoked: true,
                    revokedAt: new Date(),
                },
                { new: true }
            );
        } catch (err) {
            authLogger.error({
                message: "[SIGNOUT] Prisma error updating session",
                userSessionID,
                error: err,
            });

            throw new InternalServerError(err);
        }
    }

    // Two FA
    async saveTwoFactorSecret({
        userID,
        secret
    }: {
        userID: string;
        secret: string;
    }) {
        try {
            const user =
                await this.user.findOneAndUpdate(
                    { userID },
                    {
                        twoFactorSecret: secret
                    },
                    { new: true }
                );

            return user;
        } catch (err: any) {
            authLogger.error({
                message: "❌ [2FA] Failed to set 2fa secret in prisma",
                error: err?.message || err,
            });

            throw new NormalizedError(err);
        }
    }

    async getUserTwoFactorSettings(
        userID: string
    ) {
        try {
            const user =
                await this.user.findOne(
                    { userID },
                    {
                        userID: 1,
                        email: 1,
                        twoFactorEnabled: 1,
                        twoFactorSecret: 1,
                        twoFactorEnabledAt: 1,
                    }
                );

            return user;
        } catch (err: any) {
            authLogger.error({
                message: "❌ [2FA] Failed to get user 2FA settings",
                error: err?.message || err,
            });

            throw new NormalizedError(err);
        }
    }

    async enableTwoFactor({
        userID,
        secret
    }: {
        userID: string;
        secret: string;
    }) {
        try {
            const user =
                await this.user.findOneAndUpdate(
                    { userID },
                    {
                        twoFactorEnabled: true,
                        twoFactorSecret: secret,
                        twoFactorEnabledAt: new Date(),
                    },
                    {
                        new: true,
                        projection: {
                            userID: 1,
                            email: 1,
                            twoFactorEnabled: 1,
                        }
                    }
                );

            return user;
        } catch (err: any) {
            authLogger.error({
                message: "❌ [2FA] Failed to enable 2FA",
                error: err?.message || err,
            });

            throw new NormalizedError(err);
        }
    }

    async disableTwoFactor(
        userID: string
    ) {
        try {
            const user =
                await this.user.findOneAndUpdate(
                    { userID },
                    {
                        twoFactorEnabled: false,
                        twoFactorSecret: null,
                        twoFactorEnabledAt: null,
                    },
                    {
                        new: true,
                        projection: {
                            userID: 1,
                            email: 1,
                            twoFactorEnabled: 1,
                        }
                    }
                );

            return user;
        } catch (err: any) {
            authLogger.error({
                message: "❌ [2FA] Failed to disable 2FA",
                error: err?.message || err,
            });

            throw new NormalizedError(err);
        }
    }

    async createBackupCodes({
        userID,
        codeHashes
    }: {
        userID: string;
        codeHashes: string[]
    }) {
        try {
            await this.userSession.insertMany(
                codeHashes.map((codeHash) => ({
                    userID,
                    codeHash,
                }))
            );
        } catch (err: any) {
            authLogger.error({
                message: "❌ [2FA] Failed to create backup codes",
                error: err?.message || err,
            });

            throw new NormalizedError(err);
        }
    }
}


export type GetUserWithUsernameOrEmailResult = Awaited<ReturnType<AuthRepo["getUserWithUsernameOrEmail"]>>
export type GetUserWithUsernameResult = Awaited<ReturnType<AuthRepo["getUserWithUsername"]>>
export type GetUserWithEmailResult = Awaited<ReturnType<AuthRepo["getUserWithEmail"]>>
export type GetUserWithUserIDResult = Awaited<ReturnType<AuthRepo["getUserWithUserID"]>>

export type FindWithUsername = Awaited<ReturnType<AuthRepo["findUserWithUsername"]>>
export type FindWithEmail = Awaited<ReturnType<AuthRepo["findUserWithEmail"]>>
export type FindWithUsernameOrEmail = Awaited<ReturnType<AuthRepo["findUserWithUsernameOrEmail"]>>

export type CreateUserSessionResult = Awaited<ReturnType<AuthRepo["createUserSession"]>>;
export type FindActiveSessionResult = Awaited<ReturnType<AuthRepo["findActiveSession"]>>
export type RefreshSessionResult = Awaited<ReturnType<AuthRepo["refreshSession"]>>
export type RevokeSessionResult = Awaited<ReturnType<AuthRepo["revokeSession"]>>

export type ChangeUserPasswordResult = Awaited<ReturnType<AuthRepo["changeUserPassword"]>>
export type ChangeEmailResult = Awaited<ReturnType<AuthRepo["changeEmail"]>>
export type EnableTwoFactorResult = Awaited<ReturnType<AuthRepo["enableTwoFactor"]>>
export type DisableTwoFactorResult = Awaited<ReturnType<AuthRepo["disableTwoFactor"]>>
export type GetUserTwoFactorSettingsResult = Awaited<ReturnType<AuthRepo["getUserTwoFactorSettings"]>>
export type CreateBackupCodesResult = Awaited<ReturnType<AuthRepo["createBackupCodes"]>>
export type SaveTwoFactorSecretResult = Awaited<ReturnType<AuthRepo["saveTwoFactorSecret"]>>