export interface ContinueWithEmailDTO {
    signupSessionID: string;
    email: string;
}

export interface ContinueWithUsernameDTO {
    signupSessionID: string;
    username: string;
}

/**
 * @description Weather user want to use email or username, will be decided using zod validation.
 */
export interface GetStartedDTO {
    usernameOrEmail: {
        type: "username" | "email";
        value: string;
    };
}

export interface CompleteSignupDTO {
    signupSessionID: string;
    firstName: string;
    lastName: string;
    password: string;
    confirmPassword: string;
    dateOfBirth: Date;
}

export interface SendVerificationEmailDTO {
    signupSessionID: string;
    email: string;
    firstName: string;
    lastName: string;
    verificationCode: string;
}

export interface VerifyUserEmailDTO {
    signupSessionID: string;
    email: string;
    verificationCode: string;
}