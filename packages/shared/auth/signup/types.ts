import { JwtPayload } from 'jsonwebtoken';

export interface SignupSessionPayload extends JwtPayload {
    signupSessionID: string;
}

export type GetStartedApiData = {
    identifierType: "username" | "email";
    identifier: string;
    already_exists: boolean;
};