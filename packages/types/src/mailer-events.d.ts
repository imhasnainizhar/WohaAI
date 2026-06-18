
export interface ChangePasswordEvent {
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
    authSessionID: string,
    createdAt: Date
}

export interface ChangeEmailEvent {
    sessionID: string;
    userID: string;
    newEmail: string;
    uriSessionToken: string;
    createdOn: Date;
}