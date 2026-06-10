
export interface ForgotPasswordEvent {
    sessionID: string;
    id: string;
    username: string;
    email: string;
    uriSessionToken: string;
    createdOn: Date;
}

export interface VerifySignupEmailEvent {
    type: string,
    email: string,
    code: string,
    signupSessionID: string,
    createdAt: Date
}

export interface ChangeEmailEvent {
    sessionID: string;
    id: string;
    newEmail: string;
    uriSessionToken: string;
    createdOn: Date;
}