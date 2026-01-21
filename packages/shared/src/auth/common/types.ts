export type VerifySignupEmailEvent = {
    type: string,
    email: string,
    code: string,
    signupSessionID: string,
    createdAt: Date
}

export type VerifySigninEmailEvent = {
    type: string,
    email: string,
    code: string,
    signinSessionID: string,
    createdAt: Date
}