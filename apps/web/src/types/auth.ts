export type AuthForm = {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  dateOfBirth: Date;
  usernameOrEmail: string;
};

export interface UsernameData {
    username: string
}

export interface EmailData {
    email: string
}

export interface PersonalData {
    firstName: string;
    lastName: string;
    dateOfBirth: Date;
}