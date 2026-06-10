import { AuthRepo } from "@/repo/auth-repo";
import { UserProvisioningClient } from "@/clients/user-provision";
import { env } from "@/config/env";

import {
    SigninServiceParams,
    SigninService,
    SigninServiceResponse
} from "./signin";

import {
    SignoutServiceParams,
    SignoutService,
    SignoutServiceResponse
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
    ChangeForgottenPasswordServiceParams,
    ChangeForgottenPasswordServiceResponse,
    ForgotPasswordInitServiceParams,
    ForgotPasswordInitServiceResponse,
    ForgotPasswordService,
    VerifyForgotPasswordServiceParams,
    VerifyForgotPasswordServiceResponse
} from "./forgot-password";

import {
    ChangePasswordService,
    ChangePasswordServiceParams,
    ChangePasswordServiceResponse
} from "./change-password";

import {
    Disable2FAService,
    Disable2FAServiceParams,
    Disable2FAServiceResponse
} from "./two-fa/disable";

import {
    Enable2FAService,
    Enable2FAServiceParams,
    Enable2FAServiceResponse
} from "./two-fa/enable";

import {
    Generate2FASecretService,
    Generate2FASecretServiceParams,
    Generate2FASecretServiceResponse
} from "./two-fa/generate";

import {
    Verify2FAService,
    Verify2FAServiceParams,
    Verify2FAServiceResponse
} from "./two-fa/verify";

import { SendVerificationEmailResponse } from "@packages/contracts/auth";
import { RequestEmailChangeService, RequestEmailChangeServiceParams, RequestEmailChangeServiceResponse } from "./change-email/request";
import { VerifyEmailChangeService, VerifyEmailChangeServiceParams, VerifyEmailChangeServiceResponse } from "./change-email/verify";

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

        private readonly forgotPasswordService: ForgotPasswordService,

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

            const forgotPasswordService = new ForgotPasswordService(authRepo);

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

                forgotPasswordService,

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

    public async signin({
        usernameOrEmail,
        password,
        clientData,
    }: SigninServiceParams): Promise<SigninServiceResponse> {
        return this.signinService.execute({
            usernameOrEmail,
            password,
            clientData,
        });
    }

    public async signout({
        id,
        userSessionID
    }: SignoutServiceParams): Promise<SignoutServiceResponse> {
        return this.signoutService.execute({ id, userSessionID })
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
    }: SendVerificationServiceParams): Promise<SendVerificationEmailResponse> {
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
        clientData
    }: SignupCompleteServiceParams): Promise<SignupCompleteServiceResponse> {
        return this.signupCompleteService.execute({ signupSessionID, clientData })
    }

    public async forgotPasswordInit({
        parsed
    }: ForgotPasswordInitServiceParams): Promise<ForgotPasswordInitServiceResponse> {
        return this.forgotPasswordService.init({ parsed })
    }

    public async verifyForgetPasswordRequest({
        sessionID
    }: VerifyForgotPasswordServiceParams): Promise<VerifyForgotPasswordServiceResponse> {
        return this.forgotPasswordService.verify({ sessionID })
    }

    public async changeForgottenPassword({
        sessionID,
        password
    }: ChangeForgottenPasswordServiceParams): Promise<ChangeForgottenPasswordServiceResponse> {
        return this.forgotPasswordService.changePassword({ sessionID, password })
    }

    public async changePassword({
        id,
        oldPassword,
        newPassword
    }: ChangePasswordServiceParams): Promise<ChangePasswordServiceResponse> {
        return this.changePasswordService.execute({ id, oldPassword, newPassword })
    }

    public async generate2FASecret({
        id
    }: Generate2FASecretServiceParams): Promise<Generate2FASecretServiceResponse> {
        return this.generate2FASecretService.execute({ id })
    }

    public async verify2FA({
        id,
        token
    }: Verify2FAServiceParams): Promise<Verify2FAServiceResponse> {
        return this.verify2FAService.execute({
            id,
            token
        })
    }

    public async enable2FA({
        id,
        token
    }: Enable2FAServiceParams): Promise<Enable2FAServiceResponse> {
        return this.enable2FAService.execute({
            id,
            token
        })
    }

    public async disable2FA({
        id,
        token
    }: Disable2FAServiceParams): Promise<Disable2FAServiceResponse> {
        return this.disable2FAService.execute({
            id,
            token
        })
    }

    public async requestEmailChange({
        id,
        newEmail
    }: RequestEmailChangeServiceParams): Promise<RequestEmailChangeServiceResponse> {
        return this.requestEmailChangeService.execute({
            id,
            newEmail
        })
    }

    public async verifyEmailChange({
        sessionID
    }: VerifyEmailChangeServiceParams): Promise<VerifyEmailChangeServiceResponse> {
        return this.verifyEmailChangeService.execute({
            sessionID
        })
    }
}

const authService = AuthService.getInstance()

export default authService;