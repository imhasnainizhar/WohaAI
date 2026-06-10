
export interface GetUserResponse {
    id: string;
    firstName: string;
    lastName: string;
    username: string;
    email: string;
    profilePicURI: string | null;
    dateOfBirth: Date | null;
    twoFactorEnabled: boolean;
    createdAt: Date;
    updatedAt: Date;
}