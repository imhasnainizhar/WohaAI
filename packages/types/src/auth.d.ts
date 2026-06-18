export interface SigninCompleteResponse {
    userID: string;
    username: string;
    email: string;
}

export interface Generate2FASecretResponse {
    secret: string;
    otpauthURL: string;
}