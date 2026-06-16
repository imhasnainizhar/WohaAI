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
export interface AuthSessionPayload
    extends BaseJwtPayload {
    sub: string;
    usernameOrEmail?: UsernameOrEmail;
}

export interface ChangePasswordSessionPayload extends BaseJwtPayload {
    sub: string
}

/**
 * Custom Payload for signin flow.
 * This must be encrypted using JWE.
 */
export interface SigninFlowPayload extends BaseJwtPayload {
  emailDraft?: string;
  emailConfirmed?: boolean;
  passwordHashed?: string;
}