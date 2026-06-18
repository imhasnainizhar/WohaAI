export interface SigninCompleteResponse {
    profilePicURI?: string;
    userID: string;
    username: string;
    fullName?: string;
    email: string;
    dateOfBirth?: string;
}

export interface Generate2FASecretResponse {
    secret: string;
    otpauthURL: string;
}