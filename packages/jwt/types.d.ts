import { JwtPayload } from "jsonwebtoken";
export interface RefreshTokenPayload {
    sub: string;
    jti: string;
    iss?: string;
    aud?: string;
    iat?: number;
    exp?: number;
    userID: string;
    userSessionID: string;
    emailVerified: boolean;
    email: string;
    username: string;
}
export interface AccessTokenPayload {
    sub: string;
    jti: string;
    iss?: string;
    aud?: string;
    iat?: number;
    exp?: number;
    userID: string;
    userSessionID: string;
    emailVerified: boolean;
    email: string;
    username: string;
    role?: "user";
    permissions?: string[];
}
export interface PrivilegedAccessTokenPayload {
    sub: string;
    jti: string;
    iss?: string;
    aud?: string;
    iat?: number;
    exp?: number;
    userID: string;
    userSessionID: string;
    emailVerified: boolean;
    email: string;
    username: string;
    scope: "privileged_action";
    reason: "change_email" | "change_password" | "view_sensitive_data" | "delete_account" | "update_security_settings";
}
export interface SignupSessionPayload extends JwtPayload {
    signupSessionID: string;
}
export interface SigninSessionPayload extends JwtPayload {
    signinSessionID: string;
}
//# sourceMappingURL=types.d.ts.map