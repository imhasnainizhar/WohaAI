export interface RefreshTokenDTO {
  cookies: Record<string, any>;
  userIPAddress: string;
}

export interface RefreshTokenData {
  refreshToken: string;
  userID: string;
}