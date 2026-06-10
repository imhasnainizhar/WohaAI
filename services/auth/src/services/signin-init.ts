

import jwt, { SignOptions } from "jsonwebtoken";
import argon2 from "argon2";
import { envConfigs as env, EXPIRATION } from "@packages/config";
import { AuthRepo } from '@/repo/auth-repo';
import { InternalServerError } from "@packages/errors";
import { ClientData } from "@packages/contracts/auth";
import { authLogger } from "@packages/observability";
import { AccessTokenPayload, createJwtToken, RefreshTokenPayload } from "@packages/jwt";
import { exp } from "@/config/exp";


import { InvalidCredentialsError } from "@/errors/service-error";


export interface SigninServiceParams {
    usernameOrEmail: {
        type: "username"; value: string;
    } | {
        type: "email"; value: string;
    };
    password: string;
    clientData: ClientData;
}

export interface SigninServiceResponse {
    profilePicURI: string;
    id: string;
    username: string;
    firstName: string;
    lastName: string;
    email: string;
    refreshToken: string;
    accessToken: string;
}

export class SigninService {

    constructor(private repo: AuthRepo) { }

    /**
     * Main signin business logic
     */
    public async execute({
        usernameOrEmail,
        password,
        clientData
    }: SigninServiceParams): Promise<SigninServiceResponse> {
        const user =
            await this.repo.getUserWithUsernameOrEmail(usernameOrEmail);

        if (user === null) throw new InvalidCredentialsError()

        const isPasswordCorrect = await argon2.verify(
            user.hashedPassword,
            password
        );

        if (!isPasswordCorrect) throw new InvalidCredentialsError()

        const {
            JWT_ACCESS_SECRET_KEY,
            JWT_REFRESH_SECRET_KEY,
        } = this.getJWTSecrets();

        const userSessionID = crypto.randomUUID();
        const refreshTokenJti = crypto.randomUUID();

        // Maybe we in future make a feature to save and use jti for further security.
        const refreshToken = createJwtToken<RefreshTokenPayload>({
            payload: {
                jti: refreshTokenJti,
                sub: user.id,
                sid: userSessionID,
            },
            secret: JWT_REFRESH_SECRET_KEY,
            options: {
                expiresIn: exp.JWT_REFRESH_TOKEN
            } as SignOptions
        });


        /**
         * Persist session
         */
        const session = await this.repo.createUserSession({
            id: user.id,
            clientData,
            refreshToken,
            userSessionID,
        });

        authLogger.debug({
            message: "✅ [SESSION] Created new user session",
            id: session.id,
            ip: clientData.userIPAddress,
            device: clientData.userDeviceName,
        });

        const accessTokenJti = crypto.randomUUID();
        /**
         * Access token
         */
        const accessToken = createJwtToken<AccessTokenPayload>({
            payload: {
                jti: accessTokenJti,
                sub: user.id,
                sid: session.userSessionID,
                role: "user"
            },
            secret: JWT_ACCESS_SECRET_KEY,
            options: {
                expiresIn: exp.JWT_ACCESS_TOKEN,
            } as SignOptions
        });

        return {
            profilePicURI: user.profilePicURI || "",
            id: user.id,
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            refreshToken,
            accessToken
        }
    }

    /**
     * Validate JWT secrets existence
     */
    private getJWTSecrets() {
        const {
            JWT_ACCESS_SECRET_KEY,
            JWT_REFRESH_SECRET_KEY,
        } = env;

        if (
            !JWT_ACCESS_SECRET_KEY ||
            !JWT_REFRESH_SECRET_KEY
        ) {
            throw new InternalServerError({ message: "JWT keys misconfiguration" })
        }

        return {
            JWT_ACCESS_SECRET_KEY,
            JWT_REFRESH_SECRET_KEY,
        };
    }
}