
export interface ForgotPasswordEmailEvent {
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