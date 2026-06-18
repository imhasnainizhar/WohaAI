export interface SigninCompleteResponse {
    profilePic?: string;
    fullName?: string;
    dateOfBirth?: string;
    userID: string;
    username: string;
    email: string;
}

export interface Generate2FASecretResponse {
    secret: string;
    otpauthURL: string;
}

export type SignupCompletionResponse = {
    userID: string;
    username: string;
    email: string;
}