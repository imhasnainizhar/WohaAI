import { AuthRepo } from "@/repo/auth-repo";
import { UserProvisioningClient } from "@/clients/user-provision";

import {
    SigninService,
    CompleteSigninServiceParams,
    CompleteSigninServiceResponse,
    SigninInitServiceParams,
    SigninInitServiceResponse
} from "./signin";

import {
    SignoutServiceParams,
    SignoutService,
} from "./signout";

import {
    RefreshSessionServiceParams,
    RefreshSessionService,
    RefreshSessionServiceResponse
} from "./refresh-session";

import {
    SignupInitServiceParams,
    SignupInitService,
    SignupInitServiceResponse
} from "./signup/init";

import {
    ContinueWithEmailService,
    ContinueWithEmailServiceParams,
    ContinueWithEmailServiceResponse
} from "./signup/continue/email";

import {
    ContinueWithUsernameService,
    ContinueWithUsernameServiceParams,
    ContinueWithUsernameServiceResponse
} from './signup/continue/username';

import {
    PersonalInfoValidationService,
    PersonalInfoValidationServiceParams,
    PersonalInfoValidationServiceResponse
} from "./signup/validations/personal-info";

import {
    PasswordValidationService,
    PasswordValidationServiceParams,
    PasswordValidationServiceResponse
} from "./signup/validations/password";

import {
    SignupCompleteService,
    SignupCompleteServiceParams,
    SignupCompleteServiceResponse
} from "./signup/complete";

import {
    SendVerificationEmailService,
    SendVerificationServiceParams

} from "./signup/verification/send-verification-email";

import {
    VerifyUserEmailService,
    VerifyUserEmailServiceParams,
    VerifyUserEmailServiceResponse
} from "./signup/verification/verify-user-email";

import {
    ChangePasswordInitServiceParams,
    VerifyChangePasswordServiceParams,
    VerifyChangePasswordServiceResponse,
    ChangePasswordService,
    ChangePasswordServiceParams,
} from "./change-password";

import {
    Disable2FAService,
    Disable2FAServiceParams,
} from "./two-fa/disable";

import {
    Enable2FAService,
    Enable2FAServiceParams,
} from "./two-fa/enable";

import {
    Generate2FASecretService,
    Generate2FASecretServiceParams,
    Generate2FASecretServiceResponse
} from "./two-fa/generate";

import {
    Verify2FAService,
    Verify2FAServiceParams,
} from "./two-fa/verify";

import { RequestEmailChangeService, RequestEmailChangeServiceParams } from "./change-email/request";
import { VerifyEmailChangeService, VerifyEmailChangeServiceParams } from "./change-email/verify";
import { env } from "@packages/env-ts";

export class AuthService {
    private static instance: AuthService;

    // Making constructor public for testing. (For mocking)
    constructor(
        private readonly signinService: SigninService,
        private readonly signoutService: SignoutService,
        private readonly refreshSessionService: RefreshSessionService,

        private readonly signupInitService: SignupInitService,
        private readonly continueWithUsernameService: ContinueWithUsernameService,
        private readonly continueWithEmailService: ContinueWithEmailService,

        private readonly sendVerificationEmailService: SendVerificationEmailService,
        private readonly verifyUserEmailService: VerifyUserEmailService,

        private readonly personalInfoValidationService: PersonalInfoValidationService,
        private readonly passwordValidationService: PasswordValidationService,

        private readonly signupCompleteService: SignupCompleteService,

        private readonly changePasswordService: ChangePasswordService,

        private readonly generate2FASecretService: Generate2FASecretService,
        private readonly verify2FAService: Verify2FAService,
        private readonly enable2FAService: Enable2FAService,
        private readonly disable2FAService: Disable2FAService,

        private readonly requestEmailChangeService: RequestEmailChangeService,
        private readonly verifyEmailChangeService: VerifyEmailChangeService
    ) { }

    /**
     * Singleton accessor
     */
    public static getInstance(): AuthService {
        if (!AuthService.instance) {
            const authRepo = new AuthRepo();

            // Currently using nextjs var, but URI is same for the service
            const userProvisioningClient = new UserProvisioningClient(env.NEXT_PUBLIC_USER_API_URI);

            const signinService = new SigninService(authRepo);
            const signoutService = new SignoutService(authRepo);
            const refreshSessionService = new RefreshSessionService(authRepo);

            const signupInitService = new SignupInitService(authRepo);
            const continueWithUsernameService = new ContinueWithUsernameService(authRepo);
            const continueWithEmailService = new ContinueWithEmailService(authRepo);

            const sendVerificationEmailService = new SendVerificationEmailService();
            const verifyUserEmailService = new VerifyUserEmailService();

            const personalInfoValidationService = new PersonalInfoValidationService();
            const passwordValidationService = new PasswordValidationService();

            const signupCompleteService = new SignupCompleteService(authRepo, userProvisioningClient);

            const changePasswordService = new ChangePasswordService(authRepo);

            const generate2FASecretService = new Generate2FASecretService(authRepo);
            const verify2FAService = new Verify2FAService(authRepo);
            const enable2FAService = new Enable2FAService(authRepo);
            const disable2FAService = new Disable2FAService(authRepo);

            const requestEmailChangeService = new RequestEmailChangeService(authRepo);
            const verifyEmailChangeService = new VerifyEmailChangeService(authRepo);

            AuthService.instance = new AuthService(
                signinService,
                signoutService,
                refreshSessionService,

                signupInitService,
                continueWithUsernameService,
                continueWithEmailService,

                sendVerificationEmailService,
                verifyUserEmailService,

                personalInfoValidationService,
                passwordValidationService,

                signupCompleteService,

                changePasswordService,

                generate2FASecretService,
                verify2FAService,
                enable2FAService,
                disable2FAService,

                requestEmailChangeService,
                verifyEmailChangeService
            );
        }

        return AuthService.instance;
    }

    public async signinInit({
        usernameOrEmail,
    }: SigninInitServiceParams): Promise<SigninInitServiceResponse> {
        return this.signinService.init({
            usernameOrEmail,
        });
    }

    public async signinComplete({
        usernameOrEmail,
        password,
        clientData
    }: CompleteSigninServiceParams): Promise<CompleteSigninServiceResponse> {
        return this.signinService.complete({
            usernameOrEmail,
            password,
            clientData
        });
    }

    public async signout({
        userID,
        userSessionID
    }: SignoutServiceParams) {
        return this.signoutService.execute({ userID, userSessionID })
    }

    public async refreshSession({
        refreshToken,
        userIPAddress
    }: RefreshSessionServiceParams): Promise<RefreshSessionServiceResponse> {
        return this.refreshSessionService.execute({ refreshToken, userIPAddress })
    }

    public async signupInit({
        usernameOrEmail
    }: SignupInitServiceParams): Promise<SignupInitServiceResponse> {
        return this.signupInitService.execute({ usernameOrEmail })
    }

    public async continueWithUsername({
        signupSessionID,
        username
    }: ContinueWithUsernameServiceParams): Promise<ContinueWithUsernameServiceResponse> {
        return this.continueWithUsernameService.execute({ signupSessionID, username })
    }

    public async continueWithEmail({
        signupSessionID,
        email
    }: ContinueWithEmailServiceParams): Promise<ContinueWithEmailServiceResponse> {
        return this.continueWithEmailService.execute({ signupSessionID, email })
    }

    public async sendVerificationEmail({
        signupSessionID
    }: SendVerificationServiceParams) {
        return this.sendVerificationEmailService.execute({ signupSessionID })
    }

    public async verifyUserEmail({
        signupSessionID,
        verificationCode
    }: VerifyUserEmailServiceParams): Promise<VerifyUserEmailServiceResponse> {
        return this.verifyUserEmailService.execute({ signupSessionID, verificationCode })
    }

    public async validatePersonalInfo({
        signupSessionID,
        firstName,
        lastName,
        dateOfBirth
    }: PersonalInfoValidationServiceParams): Promise<PersonalInfoValidationServiceResponse> {
        return this.personalInfoValidationService.execute({ signupSessionID, firstName, lastName, dateOfBirth })
    }

    public async validatePassword({
        signupSessionID,
        zodValidatedPassword
    }: PasswordValidationServiceParams): Promise<PasswordValidationServiceResponse> {
        return this.passwordValidationService.execute({ signupSessionID, zodValidatedPassword })
    }

    public async completeSignup({
        signupSessionID,
        rememberMe,
        clientData
    }: SignupCompleteServiceParams): Promise<SignupCompleteServiceResponse> {
        return this.signupCompleteService.execute({ signupSessionID, rememberMe, clientData })
    }

    public async changePasswordInit({
        usernameOrEmail
    }: ChangePasswordInitServiceParams) {
        return this.changePasswordService.init({ usernameOrEmail })
    }

    public async verifyChangePasswordRequest({
        sessionID
    }: VerifyChangePasswordServiceParams): Promise<VerifyChangePasswordServiceResponse> {
        return this.changePasswordService.verify({ sessionID })
    }

    public async changePassword({
        sessionID,
        password
    }: ChangePasswordServiceParams) {
        return this.changePasswordService.changePassword({ sessionID, password })
    }

    public async generate2FASecret({
        userID
    }: Generate2FASecretServiceParams): Promise<Generate2FASecretServiceResponse> {
        return this.generate2FASecretService.execute({ userID })
    }

    public async verify2FA({
        userID,
        token
    }: Verify2FAServiceParams): Promise<{ success: boolean }> {
        return this.verify2FAService.execute({
            userID,
            token
        })
    }

    public async enable2FA({
        userID,
        token
    }: Enable2FAServiceParams) {
        return this.enable2FAService.execute({
            userID,
            token
        })
    }

    public async disable2FA({
        userID,
        token
    }: Disable2FAServiceParams) {
        return this.disable2FAService.execute({
            userID,
            token
        })
    }

    public async requestEmailChange({
        userID,
        newEmail
    }: RequestEmailChangeServiceParams) {
        return this.requestEmailChangeService.execute({
            userID,
            newEmail
        })
    }

    public async verifyEmailChange({
        sessionID
    }: VerifyEmailChangeServiceParams) {
        return this.verifyEmailChangeService.execute({
            sessionID
        })
    }
}

const authService = AuthService.getInstance()

export default authService;