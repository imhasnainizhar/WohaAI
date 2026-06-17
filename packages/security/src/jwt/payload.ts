import { JwtPayload } from "jsonwebtoken";
import { UsernameOrEmail } from '../../../contracts/dist/auth/custom-types/fields';

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
    usernameOrEmail?: UsernameOrEmail;
}

export interface ChangePasswordSessionPayload extends BaseJwtPayload {
    sub: string
}