export type SigninForm = {
    username?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
};

export interface UsernameData {
    username: string
}

export interface EmailData {
    email: string
}

export interface PersonalData {
    fullName: string;
    dateOfBirth: Date;
}