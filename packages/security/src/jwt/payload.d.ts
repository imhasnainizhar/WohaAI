import { JwtPayload } from "jsonwebtoken";
import { TUsernameOrEmail } from "@wohaai/validations";

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
interface AuthenticatedUserPayload extends BaseJwtPayload {
    sub: string;
    sid: string;
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
 * Temporary signup session token.
 */
export interface AuthSessionPayload
    extends BaseJwtPayload {
    sub: string;
    usernameOrEmail?: TUsernameOrEmail;
}

export interface ChangePasswordSessionPayload extends BaseJwtPayload {
    sub: string
}