
export interface ForgotPasswordEvent {
    sessionID: string;
    userID: string;
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
    userID: string;
    newEmail: string;
    uriSessionToken: string;
    createdOn: Date;
}