import { JwtPayload } from "jsonwebtoken";

export interface RefreshTokenPayload {
    sub: string;             // user id
    jti: string;             // refresh token id
    iss?: string;              // issuer
    aud?: string;              // audience
    iat?: number;              // issued at
    exp?: number;              // expiry

    userID: string;        // Same as sub
    userSessionID: string;       // DB session id
    emailVerified: boolean;
    email: string;
    username: string;
}

export interface AccessTokenPayload {
    sub: string;              // user id
    jti: string;              // unique token id
    iss?: string;              // issuer
    aud?: string;              // audience
    iat?: number;              // issued at
    exp?: number;              // expiry

    userID: string;
    userSessionID: string;
    emailVerified: boolean;
    email: string;
    username: string;

    role?: "user";             // Currently only user
    permissions?: string[];   // Not required right now but written
}

export interface PrivilegedAccessTokenPayload {
    sub: string;              // user id
    jti: string;              // token id (uuid)
    iss?: string;              // issuer
    aud?: string;              // audience (api domain)
    iat?: number;              // issued at
    exp?: number;              // ~5 mins from iat

    userID: string;
    userSessionID: string;        // bind to existing session
    emailVerified: boolean;
    email: string;
    username: string;

    scope: "privileged_action";
    reason:
    | "change_email"
    | "change_password"
    | "view_sensitive_data"
    | "delete_account"
    | "update_security_settings";
}

export interface SignupSessionPayload extends JwtPayload {
    signupSessionID: string;
}

export interface SigninSessionPayload extends JwtPayload {
    signinSessionID: string;
}