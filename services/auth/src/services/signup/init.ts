import { AuthSessionPayload, createJwtToken } from "@packages/security/jwt";
import { randomUUID } from "crypto";
import exp from "../../../../../packages/config/exp.json"
import { SignOptions } from "jsonwebtoken";
import { env } from "@packages/env-ts";
import { setAuthSession } from "@/redis/redis";

export interface SignupInitServiceResponse {
    authToken: string;
}

export class SignupInitService {
    public async execute(): Promise<SignupInitServiceResponse> {
        const sessionID = randomUUID();
        const jti = randomUUID();

        const authToken = createJwtToken({
            payload: {
                jti: jti,
                sub: sessionID
            } as AuthSessionPayload,
            secret: env.JWT_AUTH_SECRET_KEY,
            options: {
                expiresIn: exp.JWT_AUTH_SESSION_TOKEN
            } as SignOptions
        })

        await setAuthSession(sessionID, {})
        
        return {
            authToken
        }
    }
    
}