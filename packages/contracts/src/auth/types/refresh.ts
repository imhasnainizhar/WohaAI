import { Cookie } from "@packages/http";

export interface RefreshTokenRequest {
    cookies: Cookie[];
    userIPAddress: string;
}

export interface RefreshTokenClaims {
    refreshToken: string;
    userID: string;
}