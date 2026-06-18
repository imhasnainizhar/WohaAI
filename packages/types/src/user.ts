export interface GetMeResponse {
    userID: string;
    fullName?: string;
    username: string;
    email: string;
    profilePicURI?: string;
    dateOfBirth?: Date;
    twoFactorEnabled: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface UserCreatedResponse {
    userID: string;
    username: string;
    email: string;
}