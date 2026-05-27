import { Cookie } from "@packages/http";

export interface RefreshTokenRequest {
    cookies: Cookie[];
    userIPAddress: string;
}

export interface RefreshSessionResponse {
    newRefreshToken: string;
    newAccessToken: string;
}