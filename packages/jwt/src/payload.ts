import { JwtPayload } from "jsonwebtoken";

/**
 * Base JWT claims shared by all tokens.
 * Extends jsonwebtoken JwtPayload for standards:
 * iat, exp, aud, iss, sub, nbf, jti
 */
export interface BaseJwtPayload extends JwtPayload {
    jti: string;
}

/**
 * Authenticated user/session claims.
 */
export interface AuthenticatedUserPayload extends BaseJwtPayload {
    sub: string; // canonical user identifier

    userID: string;
    userSessionID: string;

    email: string;
    username: string;

    emailVerified: boolean;
}


/**
 * Access token payload.
 */
export interface AccessTokenPayload
    extends AuthenticatedUserPayload {
    role: "user";

    permissions?: string[];
}

/**
 * Refresh token payload.
 */
export interface RefreshTokenPayload
    extends AuthenticatedUserPayload { }

/**
 * Elevated privilege token.
 */
export interface PrivilegedAccessTokenPayload
    extends AccessTokenPayload {
    scope: "privileged_action";

    reason:
    | "change_email"
    | "change_password"
    | "view_sensitive_data"
    | "delete_account"
    | "update_security_settings";
}

/**
 * Temporary signup session token.
 */
export interface SignupSessionPayload
    extends BaseJwtPayload {
    signupSessionID: string;
}

/**
 * Temporary signin session token.
 */
export interface SigninSessionPayload
    extends BaseJwtPayload {
    signinSessionID: string;
}